import React from 'react';
import axios from 'axios';


export default function Form() {
  const [formData, setFormData] = React.useState({
    recipientFirstName: '',
    buyerFirstName: '',
    giftName: null,
    giftType: '',
    message: '',
    initials: '',
    voucher: '',
    costCode: '',
    recipientLastName: '',
    recipientEmail: '',
    buyerEmail: '',
  });

  const [submitted, setSubmitted] = React.useState(false);

  function handleChange(e) {
    setFormData((prevData) => {
      return { ...prevData, [e.target.name]: e.target.value };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  
    try {
      const response = await axios.post('/api/form', {
        recipientFirstName: formData.recipientFirstName,
        buyerFirstName: formData.buyerFirstName,
        giftName: formData.giftName,
        message: formData.message,
        initials: formData.initials,
        voucher: formData.voucher,
        costCode: formData.costCode,
        recipientLastName: formData.recipientLastName,
        recipientEmail: formData.recipientEmail,
        buyerEmail: formData.buyerEmail,
      });
  

      console.log(response.data); // Logging the response data received from the backend

      // Do something with the response if needed
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main>
     <div className='container'>
      <form onSubmit={handleSubmit}>
        <label htmlFor='buyerFirstName'> Buyer First Name:</label>
        <input
          type="text"
          placeholder=" Enter Buyers First Name "
          id="buyerFirstName"
          name="buyerFirstName"
          value={formData.buyerFirstName}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor='buyerEmail'> Buyer Email:</label>
        <input
          type="email"
          placeholder=" Enter Buyers Email Address"
          name="buyerEmail"
          id="buyerEmail"
          value={formData.buyerEmail}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <label htmlFor='giftName'>Gift Name:</label>
        <select name='giftName' id='giftName' value={formData.giftName || ""} onChange={handleChange} required>
          <option value="Select Option">Please Select an Option</option>
          <option value="Swedish Massage">Swedish Massage</option>
          <option value="Deep Tissue Massage">Deep Tissue Massage</option>
          <option value="Europa Facial">Europa Facial</option>
          <option value="Couples Massage">Couples Massage</option>
          <option value="Twos Company Massage">Twos Company Massage</option>
          <option value="Symphony #5">Symphony #5</option>
          <option value="Never Never Land">Never Never Land</option>
          <option value="Duchess of Windsor">Duchess of Windsor</option>
          <option value="Mother-Daughter Retreat">Mother-Daughter Retreat</option>
          <option value="Make It a Double">Make It a Double</option>
          <option value="Queen of Hearts">Queen of Hearts</option>
          <option value="Take Two">Take Two</option>
          <option value="Bali Retreat">Bali Retreat</option>
          <option value="Daycation Symphony #5">Daycation Symphony #5</option>
          <option value="Daycation Bali Retreat">Daycation Bali Retreat</option>
          <option value="Forty Dollars">Forty Dollars ($40.00)</option>
          <option value="Fifty Dollars">Fifty Dollars ($50.00)</option>
          <option value="One Hundred Dollars">One Hundred Dollars ($100.00)</option>
          <option value="One Hundred-Fifty Dollars">One Hundred-Fifty Dollars ($150.00)</option>
          <option value="Two Hundred Dollars">Two Hundred Dollars ($200.00)</option>
          <option value="Spa Chi">Spa Chi</option>
          </select>
        <br />
        <br />
        <label htmlFor='message'>Message:</label>
        <input
          type="text"
          placeholder=" Enter Message From Buyer"
          name="message"
          id="message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <label htmlFor='initials'>Initials #:</label>
        <input
          type="text"
          placeholder=" Workers Initials"
          name="initials"
          id="initials"
          value={formData.initials}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <label htmlFor='voucher'>Voucher #:</label>
        <input
          type="text"
          placeholder=" Enter Voucher #"
          name="voucher"
          id="voucher"
          value={formData.voucher}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <label htmlFor='costCode'>Cost Code #:</label>
        <input
          type="text"
          placeholder="Enter Cost Code Value"
          name="costCode"
          id="costCode"
          value={formData.costCode}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <label htmlFor='recipientFirstName'>Recipient First Name:</label>
        <input
          type="text"
          placeholder=" Recipients First Name "
          id="recipientFirstName"
          name="recipientFirstName"
          value={formData.recipientFirstName}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <label htmlFor='recipientLastName'> Recipient Last Name:</label>
        <input
          type="text"
          placeholder="Recipient Last Name"
          name="recipientLastName"
          id="recipientLastName"
          value={formData.recipientLastName}
          onChange={handleChange}
          required
        />
        <br />
        <br />
      <label htmlFor='recipientEmail'>Recipient Email:</label>
      <input
          type="email"
          placeholder="recipient email Address"
          name="recipientEmail"
          id="recipientEmail"
          value={formData.recipientEmail}
          onChange={handleChange}
          required
        />
        <br />
      
        <br />
        <button type="submit">Generate PDF</button>
        {submitted && (
          <h3>
            Thank You {formData.buyerFirstName}!
            For creating a gift card for a {formData.giftName}.
          </h3>
        )}
      </form>
      </div>
    </main>
  );
}      