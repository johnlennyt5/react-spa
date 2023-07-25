const express = require('express')
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const mySql = require('mysql');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const db = mySql.createConnection({
  host: 'localhost',
  user: 'dev_user',
  password: '123456',
  database: 'ButterMeDown',
  authPlugins: {
    mysql_native_password: ['mysql_native_password'],
  },
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

function generatePDF(formData, imageDataUrl) {
  return new Promise((resolve, reject) => {
    if (!imageDataUrl) {
      console.error('Image data URL not available');
      reject(new Error('Image data URL not available'));
      return;
    }

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('booking.pdf'));

    const imagePath = path.join(__dirname, 'Butter Day Spa Gift Certificate - Final - .png');
    doc.image(imagePath, 0, 0, { width: 612 });

    doc.fontSize(14).text(`${formData.recipientFirstName} ${formData.recipientLastName}`, 115, 396);
    doc.fontSize(14).text(`${formData.buyerFirstName}`, 115, 418);
    doc.fontSize(14).text(formData.giftName, 115, 440);
    doc.fontSize(14.8).text(`${formData.initials}-${formData.voucher}-${formData.costCode}`, 427, 460);
    doc.fontSize(10).text(`${formData.message}`, 105, 470);

    doc.end();

    doc.on('end', () => {
      resolve('booking.pdf');
    });
  });
}

async function fetchImage() {
  try {
    const data = await fs.promises.readFile('./Butter Day Spa Gift Certificate - Final - .png');
    const imageDataUrl = Buffer.from(data).toString('base64');
    return imageDataUrl;
  } catch (err) {
    console.error('Error reading image file:', err);
    throw err;
  }
}

app.post('/api/form', async (req, res) => {
  try {
    // Extract form data from request body
    const {
      buyerFirstName,
      buyerEmail,
      giftName,
      message,
      initials,
      voucher,
      costCode,
      recipientFirstName,
      recipientLastName,
      recipientEmail
    } = req.body;

    console.log('Form Data:', req.body);

    // Construct the SQL query for the purchased table
    const purchaseSql = `INSERT INTO purchased (buyer_first_name, buyer_email, gift_name, message, initials, voucher_num, cost_code, recipient_first_name, recipient_last_name, recipient_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Execute the query with the form values for the purchased table
    db.query(
      purchaseSql,
      [
        buyerFirstName,
        buyerEmail,
        giftName,
        message,
        initials,
        voucher,
        costCode,
        recipientFirstName,
        recipientLastName,
        recipientEmail
      ],
      (purchaseErr, purchaseResult) => {
        if (purchaseErr) {
          console.error('Error saving form data to purchased table:', purchaseErr);
          res.status(500).send('Error saving form data');
          return;
        }

        // Get the ID of the inserted row in the purchased table
        const purchasedId = purchaseResult.insertId;

        // Construct the SQL query for inserting into buyers table based on purchased data
        const buyersSql = `INSERT INTO buyers (buyer_first_name, buyer_email, purchased_id) VALUES (?, ?, ?)`;

        // Execute the query with the form values and purchased ID for the buyers table
        db.query(
          buyersSql,
          [buyerFirstName, buyerEmail, purchasedId],
          (buyersErr, buyersResult) => {
            if (buyersErr) {
              console.error('Error saving form data to buyers table:', buyersErr);
              res.status(500).send('Error saving form data');
              return;
            }

            // Get the ID of the inserted row in the buyers table
            const buyersId = buyersResult.insertId;

            // Construct the SQL query for inserting into recipients table based on purchased and buyers data
            const recipientSql = `INSERT INTO recipients (recipient_first_name, recipient_last_name, recipient_email, purchased_id, buyers_id) VALUES (?, ?, ?, ?, ?)`;

            // Execute the query with the form values, purchased ID, and buyers ID for the recipients table
            db.query(
              recipientSql,
              [recipientFirstName, recipientLastName, recipientEmail, purchasedId, buyersId],
              (recipientErr, recipientResult) => {
                if (recipientErr) {
                  console.error('Error saving form data to recipients table:', recipientErr);
                  res.status(500).send('Error saving form data');
                  return;
                }

                 // Construct the SQL query for inserting into vouchers table based on purchased data
                 const vouchersSql = `INSERT INTO vouchers (voucher_num, purchased_id) VALUES (?, ?)`;

                 // Execute the query with the form values and purchased ID for the vouchers table
                 db.query(
                   vouchersSql,
                   [voucher, purchasedId],
                   (vouchersErr, vouchersResult) => {
                     if (vouchersErr) {
                       console.error('Error saving form data to vouchers table:', vouchersErr);
                       res.status(500).send('Error saving form data');
                       return;
                     }
 
                     console.log('Form data saved to database');
                     res.status(200).send('Form data saved to database');
                   }
                 );
               }
             );
           }
         );
       }
     );
    const imageDataUrl = await fetchImage();
    const pdfFileName = await generatePDF(req.body, imageDataUrl);

    nodemailer.createTestAccount((error, account) => {
      const htmlEmail = `
        <h3>Contact Details</h3>
        <ul>
          <li>Name: ${req.body.buyerFirstName}</li>
          <li>Email: ${req.body.buyerEmail}</li>
        </ul>
        <h3>Message</h3>
        <p>${req.body.message}</p>
      `;

      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'celine48@ethereal.email',
          pass: '64D6YZzZk6BQC37w5f',
        },
      });

      const mailOptions = {
        from: 'test@testaccount.com',
        to: 'celine48@ethereal.email',
        replyTo: 'test@testaccount.com',
        subject: 'Thank You For Booking',
        text: req.body.message,
        html: htmlEmail,
        attachments: [
          {
            filename: 'ButterDaySpaGC.pdf',
            path: path.join(__dirname, pdfFileName),
            contentType: 'application/pdf',
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(500).send('Error sending email');
        } else {
          console.log('Email sent:', info.response);

          res.setHeader('Content-Disposition', 'attachment; filename="booking.pdf"');
          res.setHeader('Content-Type', 'application/pdf');

          res.sendFile(path.join(__dirname, pdfFileName));
        }
      });
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});