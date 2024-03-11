const router = require('express').Router();

const indexController = require('../controllers/index.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.post('/cred-check', indexController.credCheck);
router.post('/new-menu', authMiddleware, indexController.newMenu);
router.post('/user-menus', authMiddleware, indexController.userMenus);
router.put('/report-menu', authMiddleware, indexController.reportMenu);
router.delete('/user-menus', authMiddleware, indexController.removeMenu);
router.post('/message', authMiddleware, indexController.message);
router.get('/messages', authMiddleware, indexController.getMessages);
router.get('/user', authMiddleware, indexController.getUser);
router.put('/preferences', authMiddleware, indexController.updatePreferences);
router.put('/business', authMiddleware, indexController.updateMenuBusiness);
router.post('/create-payment-intent', indexController.createPaymentIntent)
// router.post('/register/google', indexController.registerWithGoogle);
// router.post('/user/subscribe/:girlId', authMiddleware, indexController.userSubscribe);
// router.post('/user-sent-message', authMiddleware, indexController.userSentMessage);
// router.get('/user/subscription', authMiddleware, indexController.userSubscription);
// router.get('/get-all-girls', indexController.getAllGirls);
// router.get('/choosen/girl/:id', authMiddleware, indexController.chosenGirl);
// router.get('/get-messages/:girlId/:username', authMiddleware, indexController.getMessages);

module.exports = router;