const mongoose = require('mongoose');
var moment = require('moment-timezone');
var uuid = require('uuid');
var nodemailer = require('nodemailer');
const apn = require('apn');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var multerS3 = require('multer-s3')
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const generator = require('generate-password');
const awsLogic = require('../logic/aws.logic')
const gptLogic = require('../logic/chatgpt.logic')
const { jwtKey, stripePubLiveKey, stripeSecretLiveKey, stripePubTestKey, stripeSecretTestKey } = require('../config/env')
const openai = require('../config/chatgpt')

dotenv.config();
const users = require('../models/user.schema');
const menus = require('../models/menu.schema');
const menuData = require('../models/menuData.schema');
const chatMessages = require('../models/message.schema');

// let currentPubKey = stripePubLiveKey
// let currentSecKey = stripeSecretLiveKey
let currentPubKey = stripePubTestKey
let currentSecKey = stripeSecretTestKey

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } 
  const stripe = require('stripe')(currentSecKey);

  
  exports.createPaymentIntent = async (req, res) => {
    try {
        let user = await users.findOne({ userID: req.body.userID });
        let stripeCustomerID = user.stripeCustomerID;
        if (stripeCustomerID === "") {
            stripeCustomerID = await stripe.customers.create();
            stripeCustomerID = stripeCustomerID.id;
            user.stripeCustomerID = stripeCustomerID;
            await user.save();
        }        const customer = await stripe.customers.retrieve(stripeCustomerID);

        // Fetch customer's payment methods
        const paymentMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerID,
            type: 'card', // or another type if applicable
        });

        // Fetch customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerID,
        });

        // Fetch customer's invoices
        const invoices = await stripe.invoices.list({
            customer: stripeCustomerID,
        });

        // Combine all data into a single response object
        const customerData = {
            customer,
            paymentMethods: paymentMethods.data,
            subscriptions: subscriptions.data,
            invoices: invoices.data,
        };
                // // Fetch all subscriptions for the customer
                // const subscriptions = await stripe.subscriptions.list({
                //     customer: stripeCustomerID,
                //     status: 'active', // You can adjust the status as needed
                // });
        
                // // Extract product IDs from the subscriptions
                // const productIds = subscriptions.data.map(subscription => 
                //     subscription.items.data.map(item => item.price.product)
                // ).flat();
        
                // // Fetch details of each product
                // const products = await Promise.all(
                //     productIds.map(productId => stripe.products.retrieve(productId))
                // );
                // console.log(subscriptions)
                // console.log(productIds)
                // console.log(products)
        // Create an ephemeral key for the customer
        // const ephemeralKey = await stripe.ephemeralKeys.create(
        //     { customer: stripeCustomerID },
        //     { apiVersion: '2020-08-27' } // Use the API version you're working with
        // );
        // const ephemeralKey = await stripe.products.list(
        //     { customer: stripeCustomerID },
        //     { apiVersion: '2020-08-27' } // Use the API version you're working with
        // );
        // // Create a payment intent
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: 499, // Amount in the smallest currency unit (e.g., cents for USD)
        //     currency: 'usd',
        //     customer: stripeCustomerID,
        //     metadata: { integration_check: 'accept_a_payment' },
        // });

        // // Send necessary details to the client
        // res.status(200).json({
        //     paymentIntent: paymentIntent.client_secret,
        //     ephemeralKey: ephemeralKey.secret,
        //     customer: stripeCustomerID,
        //     publishableKey: currentPubKey
        // });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
  }

  exports.createStripeSubscription = async (req, res) => {
    try {
        let user = await users.findOne({ userID: req.body.userID });
        if (user) {
            let stripeCustomerID = user.stripeCustomerID;
            if (stripeCustomerID === "") {
                stripeCustomerID = await stripe.customers.create();
                stripeCustomerID = stripeCustomerID.id;
                user.stripeCustomerID = stripeCustomerID;
                await user.save();
            }

            // Assume `priceId` is the ID of the subscription plan's price.
            // You should have this ID from your Stripe dashboard or your own database.
            const priceId = "";

            // const subscription = await stripe.subscriptions.create({
            //     customer: stripeCustomerID,
            //     items: [
            //       {price: ''},
            //     ],
            //   });
            const subscription = await stripe.subscriptions.create({
                customer: stripeCustomerID,
                items: [{ price: priceId }],
                expand: ['latest_invoice.payment_intent'],
            });
              console.log(prices)
            const subscriptionClientSecret = subscription.latest_invoice.payment_intent.client_secret;

            res.json({
                subscriptionId: subscription.id,
                clientSecret: subscriptionClientSecret,
                customer: stripeCustomerID,
                publishableKey: currentPubKey
            });
        } else {
            res.status(404).json({});
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}
exports.savePaymentMethod = async (req, res) => {
    const paymentMethodId = req.body.paymentMethodId;
    const customerId = req.body.customerId; // Assuming you already have a Stripe Customer ID

    try {
        // Attaching the payment method to the customer
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });

        // Optionally, set it as default for the customer
        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        res.send({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}
exports.credCheck = async (req, res) => {
    try {
        // let data = await gptLogic.gptMessage(undefined, undefined, undefined)
        // console.log('GPT data:', data);
        // res.status(200).json({message:"HI"})
        const body = req.body;
        console.log(body)
        let currentTimeEpoch = moment(moment().tz(moment.tz.guess())).unix()
        const { userID, email, photoURL, name, DTString } = body;
        let user = await users.findOne({ userID: userID });
        if (user) {
            const token = jwt.sign({
                userID: userID
            }, jwtKey, { expiresIn: '30d' });
            user.lastLogin = currentTimeEpoch
            user.token = token
            user.DTString = DTString
            await user.save()
            res.status(200).json({message:"success", data:{"token":token}});
            return;
        } else {
            const token = jwt.sign({
                userID: userID
            }, jwtKey, { expiresIn: '30d' });
    
            user = new users({
                userID: userID,
                name: name,
                email: email,
                stripeCustomerID: "",
                photoURL: photoURL,
                userType: "user",
                phone: "",
                preferences: "",
                createdAt: currentTimeEpoch,
                updatedAt: currentTimeEpoch,
                lastLogin: currentTimeEpoch,
                token: token,
                DTString: DTString,
                banned: false,
                paid: false,
                messageCount: 0,
                menuDetectionCount: 0,
            });
            await user.save();
            res.status(200).json({message:"success", data:{"token":token}});
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({message:"failed", data:{}})
    }
};

exports.newMenu = async (req, res) => {
    try {
        const body = req.body;
        console.log(body)
        let currentTimeEpoch = moment(moment().tz(moment.tz.guess())).unix()
        const { menuID, userID, name, email, newMenuData, businessName, businessCoords, businessAddress} = body;
        let user = await users.findOne({ userID: userID });
        let existingMenu = await menus.findOne({ userID: userID, menuID: menuID });
        if (existingMenu != null) {
            res.status(200).json({message: "success", data: existingMenu});
        } else {
            let existingMenuData = new menuData({
                menuID: menuID,
                userID: userID,
                menuData: newMenuData,
                createdAt: currentTimeEpoch,
                updatedAt: currentTimeEpoch,
            });
            let gptRes = await gptLogic.gptMessage([], newMenuData, user.preferences, "Hello")
            let gptMessage = new chatMessages({
                menuID: menuID,
                choozieID: "Choozie",
                userID: userID,
                sentFrom: "Choozie",
                message: gptRes,
                timeSent: moment(moment().tz(moment.tz.guess())).unix()+1,
                flagged: false,
            })
            let newMenu = new menus({
                menuID: menuID,
                userID: userID,
                name: name,
                email: email,
                menuPhoto: `cafe${getRandomInt(1, 8)}`,
                menuData: existingMenuData._id.toString(),
                businessName: businessName,
                businessCoords: businessCoords,
                businessAddress: businessAddress,
                lastMessage: gptRes,
                createdAt: currentTimeEpoch,
                updatedAt: currentTimeEpoch,
                flagged:false,
            });
            user.menuDetectionCount+=1
            await existingMenuData.save()
            await user.save();
            await newMenu.save();
            await gptMessage.save()
            res.status(200).json({message:"success", data: newMenu});
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({message:"failed", data:{}})
    }
};

exports.userMenus = async (req, res) => {
    try {
        const body = req.body;
        const { userID, page, limit } = body;
        let userMenus = await menus.find({ userID: userID }).limit(limit).skip(page*limit).sort({ createdAt: -1 })
        if (userMenus) {
            res.status(200).json({message:"success", data:userMenus});
        } else {
            res.status(204).json({message:"success", data: []});
        }
    } catch (e) {
        console.log("Error: ",e)
        res.status(500).send({message:"failed", data:[]})
    }
};

exports.message = async (req, res) => {
    try {
        const body = req.body;
        const { userID, menuID, message } = body;
        let user = await users.findOne({ userID: userID });
        let existingMenu = await menus.findOne({  menuID: menuID, userID: userID });
        let existingMenuData = await menuData.findOne({ userID: userID, menuID: menuID });
        let messages = await chatMessages.find({ menuID: menuID, userID: userID });
        const response = await openai.moderations.create({
            input: message,
          });
        let isFlagged = false
        if (response.results[0].flagged){
            isFlagged = true
        }
        let newMessage = new chatMessages({
            menuID: menuID,
            choozieID: "Choozie",
            userID: userID,
            sentFrom: userID,
            message: message,
            timeSent: moment(moment().tz(moment.tz.guess())).unix(),
            flagged: isFlagged,
        })
        let gptRes = await gptLogic.gptMessage(messages, existingMenuData.menuData, user.preferences, message)
        let gptMessage = new chatMessages({
            menuID: menuID,
            choozieID: "Choozie",
            userID: userID,
            sentFrom: "Choozie",
            message: gptRes,
            timeSent: moment(moment().tz(moment.tz.guess())).unix()+1,
            flagged: isFlagged,
        })
        user.messageCount+=1
        existingMenu.lastMessage = gptRes
        await user.save()
        await existingMenu.save()
        await newMessage.save()
        await gptMessage.save()
        res.status(200).json({message:"success", data:gptMessage});
    } catch (err){
        console.log(err)
        res.status(500).send({message:"failed", data:""})
    }
}

exports.getMessages = async (req, res) => {
    try {
        console.log(req.query)
        const { menuID, userID } = req.query;
        const messages = await chatMessages.find({ menuID:menuID, userID:userID });
        res.status(200).send({message:"success", data:messages});
    } catch {
        res.status(500).send({message:"failed", data:[]})
    }
}

exports.removeMenu = async (req, res) => {
    try {
        console.log(req.body)
        const { menuID, userID } = req.body;
        await menus.findOneAndDelete({ menuID:menuID, userID:userID });
        res.status(200).send({message:"success"});
    } catch (e) {
        console.log("ERROR: ",e)
        res.status(500).send({message:"failed"})
    }
}

exports.reportMenu = async (req, res) => {
    try {
        console.log(req.body)
        const { menuID, userID } = req.body;
        const menu = await menus.findOne({ menuID:menuID, userID:userID });
        menu.flagged = true
        await menu.save()
        res.status(200).send({message:"success"});
    } catch {
        res.status(500).send({message:"failed"})
    }
}

exports.getUser = async (req, res) => {
    try {
        console.log(req.query)
        const { userID } = req.query;
        let user = await users.findOne({ userID: userID });
        if (user) {
            console.log(user)
            res.status(200).send({message:"success", data:user});
        } else {
            res.status(404).send({message:"failure", data:{}});
        }
    } catch {
        res.status(500).send({message:"failed", data:[]})
    }
}

exports.updatePreferences = async (req, res) => {
    try {
        console.log(req.body)
        const { userID, preferences } = req.body;
        let user = await users.findOne({ userID: userID });
        if (user) {
            user.preferences = preferences
            await user.save()
            res.status(200).send({message:"success", data:user});
            return;
        } else {
            res.status(404).send({message:"failure", data:{}});
        }
    } catch (err){
        console.log(err)
        res.status(500).send({message:"failed", data:[]})
    }
}
exports.updateMenuBusiness = async (req, res) => {
    try {
        console.log(req.body)
        const { menuID, userID, selectedBusinessTitle, selectedBusinessCoords } = req.body;
        let menu = await menus.findOne({ menuID:menuID, userID:userID });
        if (menu) {
            menu.businessName = selectedBusinessTitle
            menu.businessCoords = selectedBusinessCoords
            await menu.save()
            res.status(200).send({message:"success"});
        } else {
            res.status(404).send({message:"failed"});
        }
    } catch (e) {
        console.log(e)
        res.status(500).send({message:"failed"})
    }
}
// exports.loginWithGoolgle = async (req, res) => {
//     try {
//         const { email_address } = req.body;
//         const user = await users.findOne({ email_address });
//         if (user) {
//             const token = jwt.sign({
//                 _id: user._id,
//                 username: user.username,
//                 email_address: user.email_address,
//                 firstName: user.firstName,
//                 lastName: user.lastName
//             }, process.env.JWT_KEY, { expiresIn: '30d' });
//             res.status(200).send({
//                 message: 'Successfully Login!',
//                 token: token,
//             });
//         } else {
//             res.status(404).send(["User does not exist"]);
//         }
//     } catch {
//         res.status(500).send(["Error logging in"])
//     }
// }
// exports.userSubscribe = async (req, res) => {
//     try {
//         const user = req.user;
//         const { card, girlHandle } = req.body;
//         stripe.charges.create(
//             {
//                 amount: 5 * 100,
//                 currency: 'usd',
//                 source: card.id,
//                 description: `Payment for ${girlHandle} Subscription`,
//             },
//             async function (err) {
//                 try {
//                     if (err) {
//                         res.status(403).json([err.code]);
//                     } else {
//                         const subscribe = new subscriptionModel({ ...req.body, status: 'Paid', user: user._id, girl: req.params.girlId });
//                         await subscribe.save();
//                         res.status(200).json(["Payment Success"]);
//                     }
//                 } catch (error) {
//                     res.status(500).json(error);
//                 }
//             });
//     } catch (error) {
//         res.status(500).json(error);
//     }
// }
// exports.userSubscription = async (req, res) => {
//     try {
//         const user = req.user;
//         console.log(user._id);
//         const girls = await subscriptionModel.find({ user: new mongoose.Types.ObjectId(user._id) }).populate('girl');
//         res.status(200).json(girls);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// }
// exports.userSentMessage = async(req,res)=>{
//     try {
//         const body = req.body;
//         const message = new messages(body);
//         await message.save();
//         res.status(200).json(["Sent Successfully!"])
//     } catch (error) {
//         res.status(200).json(error)
//     }
// }
// exports.chosenGirl = async(req,res)=>{
//     try {
//         const user = req.user;
//         const subscription = await subscriptionModel.findOne({ girl: new mongoose.Types.ObjectId(req.params.id), user: new mongoose.Types.ObjectId(user._id), status: 'Paid' });
//         if (subscription) {
//             res.status(200).json(true);
//         } else {
//             res.status(200).json(null);
//         }
//     } catch (err) {
//         res.status(500).json(err);
//     }
// }
// exports.getMessages = async(req,res)=>{
//     try {
//         const user = req.user;
//         const girlID = req.params.girlId;
//         const limit = req.body.limit;
//         const userFirstName = req.params.username;
//         const options = {
//             limit: 50,
//             sort: { timeSent: 1 }
//         };
//         const messageslist = await messages.paginate({ girlID, userFirstName }, options);
//         res.status(200).json(messageslist);
//     } catch {
//         res.status(500).send()
//     }
// }
// exports.getAllGirls = async(req,res)=>{
//     try {
//         const allGirls = await girls.find();
//         res.status(200).json(allGirls);
//     } catch (err) {
//         res.status(500).send(err);
//     }
// }