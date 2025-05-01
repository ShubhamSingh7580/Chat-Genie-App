<?php
include 'config.php';

if(isset($_POST['submit'])){
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $pass = mysqli_real_escape_string($conn, md5($_POST['password']));
    $cpass = mysqli_real_escape_string($conn, md5($_POST['Cpassword']));
    $image = $_FILES['image']['name'];
    $image_size = $_FILES['image']['size'];
    $image_tmp_name = $_FILES['image']['tmp_name'];
    $image_folder = 'uploaded_img/'.$image;

    $select = mysqli_query($conn, "SELECT * FROM `user_forms` WHERE email='$email' AND password='$pass'") or die('Query failed');

    if(mysqli_num_rows($select) > 0) {
        $message[] = 'User already exist';
    }else{
        if($pass != $cpass) {
            $message[] = 'Confirm Password not matched!';
        }elseif($image_size > 200000) {
            $message[] = 'Image size is too large!';
        }else {
            $insert = mysqli_query($conn, "INSERT INTO `user_forms`(name, email, password, image) VALUES('$name','$email','$pass','$image')") or die('Query failed');

            if($insert) {
                move_uploaded_file($image_tmp_name, $image_folder);
                $message[] = 'Registered Successfully!';
                header('location:login.php');
            }else {
                $message[] = 'Registration Failed!';
            }
        }
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
        <link rel="stylesheet" href="style2.css?v=>?php echo time(); ?>">
    </head>
    <body>
        <div class="form-container">
            <form action="" method="post" enctype="multipart/form-data">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <h3>Registration Page</h3>
                <?php
                if(isset($message)) {
                    foreach($message as $message) {
                        echo'<div class="message">'.$message.'</div>';
                    }
                }
                ?>
                <input type="text" name="name" placeholder="Your Name" class="box" required>
                <input type="email" name="email" placeholder="Email ID" class="box" required>
                <input type="password" name="password" id="Rpassword" pattern="(?=.*\d)(?=.*[a-zA-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
                    title="Password must contain at least one character, one number, and one special character." placeholder="Password" class="box" required>
                <input type="password" name="Cpassword" placeholder="Confirm Password" class="box" required>
                <input type="file" name="image" class="box" accept="image/jpg, image/jpeg, image/png ">
                <input type="submit" name="submit" value="Register Now" class="btn">
                <p>Already have an account? <a href="login.php">Login</a></p>
            </form>
        </div>
    </body>
</html>
