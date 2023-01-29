(function() {

	document.getElementById("loginbutton").addEventListener('click', (e) => {
		var form = e.target.closest("form");
		if (form.checkValidity()) {
			makeCall("POST", 'CheckLogin', e.target.closest("form"),
				function(x) {
					if (x.readyState == XMLHttpRequest.DONE) {
						var message = x.responseText;
						switch (x.status) {
							case 200:
								var user = JSON.parse(x.responseText);
								sessionStorage.setItem('username', user.username);
								if (user.role == "client") window.location.href = "HomeClient.html";
								else if (user.role == "worker") window.location.href = "HomeWorker.html";
								break;
							case 400: // bad request
								document.getElementById("errormessage").textContent = message;
								break;
							case 401: // unauthorized
								document.getElementById("errormessage").textContent = message;
								break;
							case 500: // server error
								document.getElementById("errormessage").textContent = message;
								break;
						}
					}
				}
			);
		} else {
			form.reportValidity();
		}
	});

})();

(function() {

	document.getElementById("signupbutton").addEventListener('click', (e) => {
		var form = e.target.closest("form");

		//client side check valid email format and password match
		var email = document.getElementById("email").value;
		var pwd = document.getElementById("pwd").value;
		var rpwd = document.getElementById("rpwd").value;
		var cmessage = ValidateForm(email, pwd, rpwd);

		if (cmessage != true) {
			e.preventDefault(); //prevent the page reloading when i click submit
			document.getElementById("signuperror").textContent = cmessage;
		} else {
			if (form.checkValidity()) {
				makeCall("POST", 'CheckSignUp', e.target.closest("form"),
					function(x) {
						var message = x.responseText;
						if (x.status == 200) {
							document.getElementById("signuperror").textContent = "Account created";
						}
						else {
							document.getElementById("signuperror").textContent = message;
						}
					}
				);
			} else {
				form.reportValidity();
			}
		}
	});

})();

function ValidateForm(email, pwd, rpwd) {
	var clientmessage = "";
	var emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

	if (!email.match(emailformat) || pwd != rpwd) {
		if (!email.match(emailformat) && pwd != rpwd) {
			clientmessage = "Wrong email format and passwords don't match";
		}
		else if (!email.match(emailformat)) {
			clientmessage = "Wrong email format";
		}
		else if (pwd != rpwd) {
			clientmessage = "Passwords don't match";
		}
		return clientmessage;
	}
	else {
		return true;
	}
}

