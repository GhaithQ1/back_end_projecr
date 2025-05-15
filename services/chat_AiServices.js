const asyncHandler = require("express-async-handler");
const usermodel = require("../models/userModels");
const { OpenAI } = require('openai');
const redisClient = require('./redisClient');
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const MAX_MESSAGES = 30;
const MESSAGE_EXPIRATION_MS = 48 * 60 * 60 * 1000; // 48 ساعة بالميلي ثانية

exports.SindChatAI = asyncHandler(async (req, res) => {
  try {
    let { message, threadId } = req.body;
    const userId = req.user._id.toString();

    let user = await usermodel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!threadId && user.thread_id.length > 0) {
      threadId = user.thread_id[0].id_thread;
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message content is required" });
    }

    // --- جلب الرسائل السابقة من Redis ---
    let chatHistory = [];
    try {
      const redisData = await redisClient.get(`chat_history:${userId}:${threadId}`);
      if (redisData) {
        chatHistory = JSON.parse(redisData);

        // فلترة الرسائل القديمة (أكثر من 48 ساعة) والتخلص منها
        const now = Date.now();
        chatHistory = chatHistory.filter(msg => (now - msg.timestamp) <= MESSAGE_EXPIRATION_MS);

        // الاحتفاظ بآخر 30 رسالة فقط
        if (chatHistory.length > MAX_MESSAGES) {
          chatHistory = chatHistory.slice(chatHistory.length - MAX_MESSAGES);
        }
      }
    } catch (err) {
      console.error('Error reading chat history from Redis:', err);
    }

    // --- أضف رسالة المستخدم الجديدة مع الطابع الزمني ---
    chatHistory.push({ role: 'user', content: message, timestamp: Date.now() });

    // تحضير الرسائل للإرسال إلى OpenAI بدون الطابع الزمني
    const messagesToSend = chatHistory.map(msg => ({ role: msg.role, content: msg.content }));

    // إعداد الاستجابة للـ stream
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let botResponse = '';
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messagesToSend,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        botResponse += content;
        res.write(`data: ${content}\n\n`);
      }
    }

    // أضف رد البوت مع الطابع الزمني
    chatHistory.push({ role: 'assistant', content: botResponse, timestamp: Date.now() });

    // إحفظ المحادثة بعد فلترة وتنظيف الرسائل القديمة + بحدود آخر 30 رسالة
    try {
      // فلترة بعد إضافة رد البوت، لأن الوقت مضى
      const now = Date.now();
      chatHistory = chatHistory.filter(msg => (now - msg.timestamp) <= MESSAGE_EXPIRATION_MS);

      if (chatHistory.length > MAX_MESSAGES) {
        chatHistory = chatHistory.slice(chatHistory.length - MAX_MESSAGES);
      }

      await redisClient.set(`chat_history:${userId}:${threadId}`, JSON.stringify(chatHistory));
    } catch (err) {
      console.error('Error saving chat history to Redis:', err);
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    console.error("Chat AI error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});






exports.GetChatAI = asyncHandler(async (req, res, next) => {
  try {
    // جلب المستخدم بناءً على الـ userId
    const user = await usermodel.findById(req.user._id);
    
    // إذا لم يكن لدى المستخدم أي محادثات، ارجع برسالة فارغة
    if (!user || !user.thread_id || user.thread_id.length === 0) {
      return res.json({ messages: [] });
    }

    // الحصول على الـ thread_id المحدد من الطلب
    const threadId = req.params.id;// فرضًا يتم إرسال الـ thread_id في الـ URL

    // تحقق من وجود threadId
    if (!threadId) {
      return res.json({ messages: [] });
    }

    // تحقق من أن الـ thread_id موجود في الـ user.thread_id
    const selectedThread = user.thread_id.find(thread => thread.id_thread === threadId);
    if (!selectedThread) {
      console.log("⚠️ No matching thread found for threadId:", threadId);
      return res.json({ messages: [] });
    }

    // جلب الرسائل من Redis باستخدام userId و threadId
    let chatHistory = [];
    try {
      const redisData = await redisClient.get(`chat_history:${req.user._id}:${threadId}`);
      if (redisData) {
        chatHistory = JSON.parse(redisData);
      }
    } catch (err) {
      console.error('Error reading chat history from Redis:', err);
    }
    res.json({ messages: chatHistory });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "فشل في استرجاع المحادثة." });
  }
});

exports.CreateNewThread = asyncHandler(async (req, res, next) => {
  try {
    const user = await usermodel.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // تأكد أن thread_id مصفوفة
    if (!Array.isArray(user.thread_id)) {
      user.thread_id = [];
    }

    // إنشاء thread جديد
    const thread = await openai.beta.threads.create();

    // حفظ thread الجديد
    user.thread_id.push({ id_thread: thread.id });
    await user.save();

    // إنشاء سجل رسائل جديد وفارغ في Redis لهذا الـ threadId
    try {
      await redisClient.set(`chat_history:${req.user._id}:${thread.id}`, JSON.stringify([]));
    } catch (err) {
      console.error('Error initializing chat history for new thread in Redis:', err);
    }

    // إرسال الاستجابة مع thread_id الجديد
    res.status(201).json({
      message: "Thread created successfully",
      thread_id: thread.id // تأكد من إرسال thread_id للمستخدم
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// دالة لحذف محادثة
exports.DeleteThread = asyncHandler(async (req, res, next) => {
  try {
    const threadId = req.params.id;
    if (!threadId) {
      return res.status(400).json({ error: "Thread ID is required" });
    }

    // جلب المستخدم من قاعدة البيانات
    const user = await usermodel.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // التحقق من وجود المحادثة في قائمة محادثات المستخدم
    const threadIndex = user.thread_id.findIndex(thread => thread.id_thread === threadId);
    if (threadIndex === -1) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // حذف المحادثة من قائمة المستخدم
    user.thread_id.splice(threadIndex, 1);
    await user.save();

    // حذف سجل الرسائل من Redis لهذا الـ threadId
    try {
      await redisClient.del(`chat_history:${req.user._id}:${threadId}`);
    } catch (err) {
      console.error('Error deleting chat history from Redis:', err);
    }

    // محاولة حذف المحادثة من OpenAI
    try {
      await openai.beta.threads.del(threadId);
    } catch (openaiError) {
      console.error("Error deleting thread from OpenAI:", openaiError);
      // نستمر حتى لو فشل الحذف من OpenAI لأننا حذفنا من قاعدة البيانات بالفعل
    }

    res.status(200).json({
      message: "Thread deleted successfully",
      threadId: threadId
    });

  } catch (err) {
    console.error("Error deleting thread:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




