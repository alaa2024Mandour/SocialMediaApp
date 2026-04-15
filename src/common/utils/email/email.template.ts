export const emailTemplate = (otp: number) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Verify Your Account</title>
</head>

<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial, Helvetica, sans-serif;">

<table align="center" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#ff7a18,#28a745);padding:25px;text-align:center;">
<h2 style="color:#fff;margin:0;">
SocialHub
</h2>
<p style="color:#eaffea;font-size:14px;margin-top:5px;">
Connect. Share. Enjoy.
</p>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:30px;text-align:center;">

<p style="color:#444;font-size:16px;margin-bottom:10px;">
Hey there 👋
</p>

<p style="color:#666;font-size:15px;">
Use this code to verify your account and start exploring the community.
</p>

<div style="
background:#fff4e6;
border:2px dashed #ff7a18;
border-radius:10px;
padding:20px;
margin:30px 0;
font-size:30px;
letter-spacing:8px;
font-weight:bold;
color:#28a745;
">
${otp}
</div>

<p style="color:#888;font-size:14px;">
This code will expire in a few minutes. Don't share it with anyone.
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f1fdf4;padding:20px;text-align:center;">

<p style="color:#28a745;font-size:13px;margin:0;">
Stay social. Stay connected 💬
</p>

<p style="color:#bbb;font-size:12px;margin-top:10px;">
© 2026 SocialHub. All rights reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
};