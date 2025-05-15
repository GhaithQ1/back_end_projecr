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

    const allowedExtensions = ['.pdf', '.txt', '.docx', '.csv', '.jpeg', '.jpg', '.png'];
    const fileIds = [];

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(ext)) {
          fs.unlinkSync(file.path);
          return res.status(400).json({ error: `Unsupported file type: ${ext}` });
        }

        const uploadRes = await openai.files.create({
          file: fs.createReadStream(file.path),
          purpose: "assistants",
          name: file.originalname,
        });

        fileIds.push(uploadRes.id);
        fs.unlinkSync(file.path);
      }
    }

    // 1. جلب الرسائل السابقة من Redis
    let chatHistory = [];
    try {
      const redisData = await redisClient.get(`chat_history:${userId}:${threadId}`);
      if (redisData) {
        chatHistory = JSON.parse(redisData);
      }
    } catch (err) {
      console.error('Error reading chat history from Redis:', err);
    }

    // 2. أضف رسالة المستخدم الجديدة
    chatHistory.push({ role: 'user', content: message });

    // Prepare message data for OpenAI
    const messagesToSend = chatHistory.map(msg => ({ role: msg.role, content: msg.content }));

    // Initialize the streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send the message to the OpenAI API and stream the response
    let botResponse = '';
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messagesToSend,
      stream: true,
    });

    // Write each chunk of the assistant's response
    for await (const chunk of completion) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        botResponse += content;
        res.write(`data: ${content}\n\n`);
      }
    }

    // 3. أضف رد البوت إلى المحادثة واحفظها في Redis
    chatHistory.push({ role: 'assistant', content: botResponse });
    try {
      await redisClient.set(`chat_history:${userId}:${threadId}`, JSON.stringify(chatHistory));
    } catch (err) {
      console.error('Error saving chat history to Redis:', err);
    }

    // Send the completion signal and end the stream
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

    // تحقق من أن الـ thread_id موجود في الـ user.thread_id

    const selectedThread = user.thread_id.find(thread => thread.id_thread === threadId);
    
    // إذا لم يكن هناك thread_id مطابق، ارجع برسالة فارغة
if (!selectedThread) {
  console.log("⚠️ No matching thread found for threadId:", threadId);
  return res.json({ messages: [] });
}
    // استدعاء الرسائل الخاصة بالمحادثة عبر OpenAI API
    const messages = await openai.beta.threads.messages.list(selectedThread.id_thread);



    // تنسيق الرسائل لتتوافق مع الهيكل المطلوب
    const formatted = messages.data.map(m => ({
      role: m.role,
      content: m.content[0]?.text?.value || "", // التأكد من وجود النص
    })).reverse(); // من الأقدم للأحدث
    
    // إرسال الرسائل بعد تنسيقها
    res.json({ messages: formatted });

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
      return res.status(404).json({ error: "Thread not found for this user" });
    }

    // حذف المحادثة من قائمة محادثات المستخدم
    user.thread_id.splice(threadIndex, 1);
    await user.save();

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




