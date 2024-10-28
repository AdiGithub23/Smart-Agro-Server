const { Message, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { addNotification } = require('./notificationController'); 

exports.createMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const receiverRole = receiver.user_role;
    // const senderCreatedById = req.user.createdById;
    // const receiverCreatedById = receiver.createdById;

    console.log("senderId: ", req.user.id);
    console.log("senderRole: ", req.user.role);
    console.log("senderCreatedById: ", req.user.createdById);
    console.log("receiverId: ", receiver.id);
    console.log("receiverRole: ", receiver.user_role);
    console.log("receiverCreatedById: ", receiver.createdById);

    if (senderRole === 'slt-admin') {
      if (receiverRole !== 'customer-admin') {
        return res.status(403).json({ error: 'slt-admin can only message customer-admin users.' });
      }
    }
    else if (senderRole === 'customer-admin') {
      if (receiverRole === 'customer-manager' && receiver.createdById !== senderId) {
        return res.status(403).json({ error: 'You can only message customer-manager users you created.' });
      } else if (receiverRole !== 'slt-admin' && receiverRole !== 'customer-manager') {
        return res.status(403).json({ error: 'You can only message slt-admins or your created customer-managers.' });
      }
    }
    else if (senderRole === 'customer-manager') {
      if (receiverRole !== 'customer-admin' || req.user.createdById !== receiverId) {
        return res.status(403).json({ error: 'You can only message the customer-admin who created you.' });
      }
    }
    else {
      return res.status(403).json({ error: 'Messaging is not allowed for your role.' });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
    });
    console.log("\n# Message Created !");
    // Trigger notification creation for the receiver
    // await Notification.create({
    //   deviceId: null,
    //   receiverId: receiverId,
    //   notificationType: "Message",
    //   notificationTitle: "New Message Received",
    //   message: content,
    //   isRead: false,
    // });
    // console.log("\n# Notification Created !");
    // res.status(201).json(newMessage);
    // console.log("\n# Notification Succeeded !");

    try {
      const notification = await Notification.create({
        deviceId: null,
        notificationType: "Message",
        notificationTitle: "New Message Received",
        message: content,
        isRead: false,
        receiverId: receiverId,
      });      
      // await NotificationReceiver.create({
      //   notificationId: notification.id,
      //   receiverId: receiverId,
      //   isRead: false,
      // });
      console.log('Notification created successfully');
      console.log('Notification:', notification.toJSON());
      
      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          message: newMessage,
          notification: notification
        }
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      return res.status(201).json({
        success: true,
        message: 'Message sent successfully (notification creation failed)',
        data: {
          message: newMessage
        }
      });
    }

  } catch (err) {
    console.error('Error in createMessage:', err);
    res.status(500).json({ error: err.message });
  }
};

// Conversations with a Specific User
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUser, receiverId: userId },
          { senderId: userId, receiverId: currentUser },
        ],
      },
      order: [['timestamp', 'ASC']],
    });

    res.status(200).json(messages);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

// To View All Message Conversations of the logged-in user
// exports.getAllMessages = async (req, res) => {
//   try {
//     const currentUser = req.user.id;
    
//     const messages = await Message.findAll({
//       where: {
//         [Op.or]: [
//           { senderId: currentUser },
//           { receiverId: currentUser },
//         ],
//       },
//       order: [['timestamp', 'ASC']],
//     });

//     res.status(200).json(messages);s
//   } catch (err) {
//     if (!res.headersSent) {
//       res.status(500).json({ error: err.message });
//     }
//   }




//   //   try {
//   //     const currentUser = req.user.id;
//   //     const messages = await Message.findAll({
//   //         where: {
//   //               [Op.or]: [
//   //                 { senderId: currentUser },
//   //                 { receiverId: currentUser },
//   //               ],
//   //             },
//   //         include: [
//   //             { model: User, as: 'Sender', attributes: ['id', 'full_name', 'email', 'address', 'phone_number'] },
//   //             { model: User, as: 'Receiver', attributes: ['id', 'full_name', 'email', 'address', 'phone_number'] },
//   //         ],
//   //     });
//   //     res.json(messages);
//   // } catch (error) {
//   //     console.error('Error fetching messages:', error);
//   //     res.status(500).json({ error: 'Failed to fetch messages' });
//   // }
// };

// Unique User ids / All message Details
exports.getMessagers = async (req, res) => {
  try {
    const { originalUrl } = req;
    const pathSegments = originalUrl.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    // Check if the last segment is an integer
    if (Number.isInteger(parseInt(lastSegment, 10))) {
      const userId = parseInt(lastSegment, 10);
      return res.redirect(`/${userId}`);
    }
    
    const currentUser = req.user.id;
    
    const messages  = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUser },
          { receiverId: currentUser },
        ],
      },
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'full_name', 'email', 'address', 'company', 'phone_number', 'user_role'] },
        { model: User, as: 'Receiver', attributes: ['id', 'full_name', 'email', 'address', 'company', 'phone_number', 'user_role'] },
      ],
      order: [['timestamp', 'ASC']],
    });

    // Extract unique users who have communicated with the current user
    const users = {};
    messages.forEach(message => {
      if (message.senderId !== currentUser) {
        users[message.Sender.id] = message.Sender;
      }
      if (message.receiverId !== currentUser) {
        users[message.Receiver.id] = message.Receiver;
      }
    });

    // Convert the users object into an array
    const uniqueUsers = Object.values(users);
    res.status(200).json(uniqueUsers);
    // res.status(200).json(messages);
    
  } catch (err) {
    // res.status(500).json({ error: err.message });
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }

}

// Unique users + All Conversations
// exports.getAllMessages = async (req, res) => {
//   try {
//     const currentUser = req.user.id;

//     // Fetch all messages involving the current user
//     const messages = await Message.findAll({
//       where: {
//         [Op.or]: [
//           { senderId: currentUser },
//           { receiverId: currentUser },
//         ],
//       },
//       include: [
//         { model: User, as: 'Sender', attributes: ['id', 'full_name', 'email'] },
//         { model: User, as: 'Receiver', attributes: ['id', 'full_name', 'email'] },
//       ],
//       order: [['timestamp', 'ASC']],
//     });

//     // Extract unique users who have communicated with the current user
//     const users = {};
//     const conversations = {};

//     messages.forEach(message => {
//       // Identify the other user in the conversation
//       const otherUser = (message.senderId === currentUser) ? message.Receiver : message.Sender;
      
//       // Add the other user to the unique users list if not already added
//       if (!users[otherUser.id]) {
//         users[otherUser.id] = otherUser;
//         conversations[otherUser.id] = [];
//       }
      
//       // Add the message to the corresponding conversation
//       conversations[otherUser.id].push({
//         id: message.id,
//         content: message.content,
//         sender: message.Sender.full_name,
//         receiver: message.Receiver.full_name,
//         timestamp: message.timestamp
//       });
//     });

//     // Convert the users object into an array
//     const uniqueUsers = Object.values(users);

//     // Prepare the response object with users and their conversations
//     const response = {
//       uniqueUsers: uniqueUsers,
//       conversations: conversations
//     };

//     res.status(200).json(response);
//   } catch (err) {
//     if (!res.headersSent) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// };

// Unique users with all conversations of unique users
exports.getConversations = async (req, res) => {
  try {
    const currentUser = req.user.id;

    // Step 1: Fetch all messages where the current user is either the sender or the receiver
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUser },
          { receiverId: currentUser },
        ],
      },
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'full_name', 'address', 'company', 'phone_number', 'email', 'user_role' ] },
        { model: User, as: 'Receiver', attributes: ['id', 'full_name', 'address', 'company', 'phone_number', 'email', 'user_role' ] },
      ],
      order: [['timestamp', 'ASC']],
    });

    // Step 2: Organize the data to include unique users and their corresponding messages
    const users = {};

    messages.forEach(message => {
      const otherUser = message.senderId === currentUser ? message.Receiver : message.Sender;
      if (!users[otherUser.id]) {
        users[otherUser.id] = {
          id: otherUser.id,
          full_name: otherUser.full_name,
          address: otherUser.address,
          company: otherUser.company,
          phone_number: otherUser.phone_number,
          email: otherUser.email,
          user_role: otherUser.user_role,
          messages: []
        };
      }

      users[otherUser.id].messages.push({
        id: message.id,
        content: message.content,
        sender: message.Sender.full_name,
        receiver: message.Receiver.full_name,
        timestamp: message.timestamp
      });
    });

    // Convert the users object into an array
    const userMessages = Object.values(users);

    res.status(200).json(userMessages);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

// Latest Messages of a user
exports.getLatestMessages = async (req, res) => {
  try {
    const latestMessage = await Message.findAll({
      where: { receiverId: req.user.id }, // Assuming `receiverId` is the foreign key for the logged-in user
      order: [['createdAt', 'DESC']], // Sorting by creation date in descending order to get the latest message
      limit: 1
    });

    if (!latestMessage) {
      return res.status(404).json({ message: "No messages found!" });
    }

    res.status(200).json(latestMessage);
  } catch (error) {
    console.log("\ngetLatestMessages Failed", error);
    res.status(500).json({ error: error.message });
  }
};

