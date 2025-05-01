<?php
include 'config.php';
session_start();

if(isset($_POST['submit'])){
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $pass = mysqli_real_escape_string($conn, md5($_POST['password']));

    $select = mysqli_query($conn, "SELECT * FROM `user_forms` WHERE email='$email' AND password='$pass'") or die('Query failed');

    if(mysqli_num_rows($select) > 0) {
        $row = mysqli_fetch_assoc($select);
        $_SESSION['user_id'] = $row['id'];
        header('location:home.php');
    }else{
        $message[] = 'Incorrect email or password!';
    }
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Register</title>
        <link rel="icon" type="image/png" href="images/appicon2.png" />
        <link rel="stylesheet" href="style2.css">
    </head>
    <body>
        <div class="form-container">
            <form action="" method="post" enctype="multipart/form-data">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <h3>Login Page</h3>
                <?php
                if(isset($message)) {
                    foreach($message as $message) {
                        echo'<div class="message">'.$message.'</div>';
                    }
                }
                ?>
                <input type="email" name="email" placeholder="Email ID" class="box" required>
                <input type="password" name="password" placeholder="Password" class="box" required>
                <input type="submit" name="submit" value="Login Now" class="btn">
                <p><a href="forgot_password.php">Forgot Password</a></p>
                <p>Don't have an account? <a href="register.php">Register</a></p>
            </form>
        </div>
    </body>
</html>
