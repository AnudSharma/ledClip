
<?php
session_start();
ob_start();
$errors = array();
$servername = "127.0.0.1";
$username = "root";
$password = "K1dzteam!";
$dbname = "FitData";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error)
{
    die("Connection failed: " . $conn->connect_error);
}

$email = $_GET['username'];
$password = $_GET['password'];
$loginType = $_GET['loginType'];
if($loginType == "register")
{
        if( empty($email) || empty($password)){
                if (empty($email) && empty($password)) {
                        $json_arr = array('error'=> "Email & Password is required" );
                        $json_data = json_encode($json_arr);
                }

                if (empty($email)) {
                        $json_arr = array('error'=> "Email is required" );
                        $json_data = json_encode($json_arr);

                }
                if (empty($password)) {
                        $json_arr = array('error'=> "Password is required");
                        $json_data = json_encode($json_arr);
                }
        }
        else
        {
                $password = md5($password);
                $query = "SELECT * from users WHERE email = '$email'";
                $result = $conn->query($query);
                if($result->num_rows > 0)
                {
                        $json_arr = array('error'=> "Email already Registered! Please Login");
                }
                else
                {      
                        $json_arr = array('register'=> "success",'username' => $email, 'password' => $password);
                }
                $json_data = json_encode($json_arr);
        }
}

if($loginType == "login")
{
        if( empty($email) || empty($password)){
                if (empty($email) && empty($password)) {
                        $json_arr = array('error'=> "Email & Password is required" );
                        $json_data = json_encode($json_arr);
                }

                if (empty($email)) {
                        $json_arr = array('error'=> "Email is required" );
                        $json_data = json_encode($json_arr);

                }
                if (empty($password)) {
                        $json_arr = array('error'=> "Password is required");
                        $json_data = json_encode($json_arr);

                }
        }
	
        else
        {
                $password = md5($password);
                $query = "SELECT * from users WHERE email = '$email'";
                $result = $conn->query($query);
                if($result->num_rows > 0)
                {
			$row = $result->fetch_assoc();
			if($row['pswrd']==$password)
			{
                        	$json_arr = array('login'=> "success",'username' => $email, 'password' => $password);
                	}
			else
			{
				$json_arr = array('error'=> "Password does not match! Please Login Again");
			}
			

		}
                else
                {
                        $json_arr = array('error'=> "User not Registered! Please Register");
                }
        }
        $json_data = json_encode($json_arr);
}

echo $json_data;
ob_end_flush();
?>

