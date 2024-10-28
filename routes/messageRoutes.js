const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authorizeSltOrCustomOrManager } = require('../middleware/authorize');

router.post('/', authorizeSltOrCustomOrManager, messageController.createMessage);
router.get('/conversations', authorizeSltOrCustomOrManager, messageController.getConversations);
router.get('/users', authorizeSltOrCustomOrManager, messageController.getMessagers);
// router.get('/:userId/latest', authorizeSltOrCustomOrManager, messageController.getLatestMessages );
router.get('/lastmessages', authorizeSltOrCustomOrManager, messageController.getLatestMessages);

// router.get('/:userId', authorizeSltOrCustomOrManager, messageController.getMessages);
router.get('/:userId', authorizeSltOrCustomOrManager, async (req, res, next) => {
    const { userId } = req.params;
    if (Number.isInteger(parseInt(userId, 10))) {
      return messageController.getMessages(req, res);
    } else {
      return res.status(404).json({ error: 'Invalid user ID' });
    }
  });

module.exports = router;

