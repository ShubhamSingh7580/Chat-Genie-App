<?php
include 'config.php';

if(isset($_POST['submit'])){
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $new_pass = mysqli_real_escape_string($conn, md5($_POST['new_password']));
    $confirm_pass = mysqli_real_escape_string($conn, md5($_POST['confirm_password']));

    $select = mysqli_query($conn, "SELECT * FROM user_forms WHERE email='$email'") or die('Query failed');

    if(mysqli_num_rows($select) > 0){
        if($new_pass != $confirm_pass){
            $message[] = 'Passwords do not match!';
        }else{
            mysqli_query($conn, "UPDATE user_forms SET password='$confirm_pass' WHERE email='$email'") or die('Query failed');
            $message[] = 'Password updated successfully!';
            header('location: login.php');
        }
    }else{
        $message[] = 'No account found with this email!';
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password</title>
    <link rel="icon" type="image/png" href="images/appicon2.png" />
    <link rel="stylesheet" href="style2.css">
</head>
<body>
    <div class="form-container">
        <form action="" method="post">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <h3>Reset Password</h3>
            <?php
            if(isset($message)) {
                foreach($message as $message) {
                    echo '<div class="message">'.$message.'</div>';
                }
            }
            ?>
            <input type="email" name="email" placeholder="Enter Your Email" class="box" required>
            <input type="password" name="new_password" placeholder="Enter New Password" class="box" required>
            <input type="password" name="confirm_password" placeholder="Confirm New Password" class="box" required>
            <input type="submit" name="submit" value="Update Password" class="btn">
            <p>Remember your password? <a href="login.php">Login</a></p>
        </form>
    </div>
</body>
</html>
