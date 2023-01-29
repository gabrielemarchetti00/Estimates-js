{

	// page components
	let estimateList, estimateDetails, productList, estimateOptions, createEstimate,
		pageOrchestrator = new PageOrchestrator(); // main controller

	window.addEventListener("load", () => {
		if (sessionStorage.getItem("username") == null) {
			window.location.href = "index.html";
		} else {
			pageOrchestrator.start();
			pageOrchestrator.refresh();
		}
	}, false);


	// Constructors of view components
	function PersonalMessage(_username, messagecontainer) {
		this.username = _username;
		this.show = function() {
			messagecontainer.textContent = this.username;
		}
	}

	function EstimateList(_alert, _estimatecontainer, _estimatecontainerbody) {
		this.alert = _alert;
		this.estimatecontainer = _estimatecontainer;
		this.estimatecontainerbody = _estimatecontainerbody;

		this.reset = function() {
			this.estimatecontainer.style.visibility = "hidden";
		}

		this.show = function(next) {
			var self = this;
			makeCall("GET", "GetClientEstimates", null,
				function(req) {
					if (req.readyState == 4) {
						var message = req.responseText;
						if (req.status == 200) {
							var estimates = JSON.parse(req.responseText);
							if (estimates.length == 0) {
								self.alert.textContent = "No estimates requested yet";
								return;
							}
							self.update(estimates);
							if (next) next();

						} else if (req.status == 403) {
							window.location.href = req.getResponseHeader("Location");
							window.sessionStorage.removeItem('username');
						}
						else {
							self.alert.textContent = message;
						}
					}
				}
			);
		};

		this.update = function(arrayEstimates) {
			var row, idcell, linkcell, anchor;
			this.estimatecontainerbody.innerHTML = "";
			var self = this;
			arrayEstimates.forEach(function(estimate) {
				row = document.createElement("tr");

				idcell = document.createElement("td");
				idcell.textContent = estimate.id;
				row.appendChild(idcell);

				linkcell = document.createElement("td");
				anchor = document.createElement("a");
				linkcell.appendChild(anchor);
				linkText = document.createTextNode("Show");
				anchor.appendChild(linkText);
				anchor.setAttribute('estimateid', estimate.id);
				anchor.addEventListener("click", (e) => {
					estimateDetails.show(e.target.getAttribute("estimateid"));
					estimateOptions.show(e.target.getAttribute("estimateid"));
				}, false);
				anchor.href = "#";
				row.appendChild(linkcell);
				self.estimatecontainerbody.appendChild(row);
			});
			this.estimatecontainer.style.visibility = "visible";
		}

	}

	function EstimateDetails(options) {
		this.alert = options['alert'];
		this.detailcontainer = options['detailcontainer'];
		this.product = options['product'];
		this.price = options['price'];
		this.estimatedetailstable = options['estimatedetailstable'];

		this.reset = function() {
			this.detailcontainer.style.visibility = "hidden";
			this.estimatedetailstable.style.visibility = "hidden";
		}

		this.show = function(estimateid) {
			var self = this;
			makeCall("GET", "GetEstimateDetails?estimateid=" + estimateid, null,
				function(req) {
					if (req.readyState == 4) {
						var message = req.responseText;
						if (req.status == 200) {
							var estimate = JSON.parse(req.responseText);
							self.update(estimate);
							self.detailcontainer.style.visibility = "visible";
							self.estimatedetailstable.style.visibility = "visible";
						} else if (req.status == 403) {
							window.location.href = req.getResponseHeader("Location");
							window.sessionStorage.removeItem('username');
						}
						else {
							self.alert.textContent = message;
						}
					}
				}
			);
		};

		this.update = function(e) {
			this.product.textContent = e.product;
			if (e.price == 0) {
				this.price.textContent = "not assigned yet";
			}
			else {
				this.price.textContent = e.price;
			}
		}
	}

	function EstimateOptions(_alert, _optioncontainer, _optioncontainerbody) {
		this.alert = _alert;
		this.optioncontainer = _optioncontainer;
		this.optioncontainerbody = _optioncontainerbody;

		this.reset = function() {
			this.optioncontainer.style.visibility = "hidden";
		}

		this.show = function(estimateid) {
			var self = this;
			makeCall("GET", "GetEstimateOptions?estimateid=" + estimateid, null,
				function(req) {
					if (req.readyState == 4) {
						var message = req.responseText;
						if (req.status == 200) {
							var options = JSON.parse(req.responseText);
							if (options.length == 0) {
								self.alert.textContent = "No options";
								return;
							}
							self.update(options);
							if (next) next();

						} else if (req.status == 403) {
							window.location.href = req.getResponseHeader("Location");
							window.sessionStorage.removeItem('username');
						}
						else {
							self.alert.textContent = message;
						}
					}
				}
			);
		};

		this.update = function(arrayOptions) {
			var row, namecell, typecell;
			this.optioncontainerbody.innerHTML = "";
			var self = this;
			arrayOptions.forEach(function(option) {
				row = document.createElement("tr");

				namecell = document.createElement("td");
				namecell.textContent = option.name;
				row.appendChild(namecell);

				typecell = document.createElement("td");
				typecell.textContent = option.type;
				row.appendChild(typecell);

				self.optioncontainerbody.appendChild(row);
			});
			this.optioncontainer.style.visibility = "visible";
		}
	}

	function ProductList(_alert, _productcontainer, _productcontainerbody) {
		this.alert = _alert;
		this.productcontainer = _productcontainer;
		this.productcontainerbody = _productcontainerbody;

		this.show = function(next) {
			var self = this;
			makeCall("GET", "GetProductsAndOptions", null,
				function(req) {
					if (req.readyState == 4) {
						var message = req.responseText;
						if (req.status == 200) {
							var prodAndOpt = JSON.parse(req.responseText);
							if (prodAndOpt.length == 0) {
								self.alert.textContent = "No products and options";
								return;
							}
							self.update(prodAndOpt.products, prodAndOpt.options);
							if (next) next();

						} else if (req.status == 403) {
							window.location.href = req.getResponseHeader("Location");
							window.sessionStorage.removeItem('username');
						}
						else {
							self.alert.textContent = message;
						}
					}
				}
			);
		};

		this.update = function(arrayProducts, arrayOptions) {
			var row, idcell, namecell, linkcell, anchor;
			this.productcontainerbody.innerHTML = "";
			var self = this;
			arrayProducts.forEach(function(product) {
				row = document.createElement("tr");

				idcell = document.createElement("td");
				idcell.textContent = product.id;
				row.appendChild(idcell);

				namecell = document.createElement("td");
				namecell.textContent = product.name;
				row.appendChild(namecell);

				var image = new Image();
				image.src = 'data:image/jpeg;base64,' + product.image;
				image.height = 200;
				image.witdh = 200;
				row.appendChild(image);

				linkcell = document.createElement("td");
				anchor = document.createElement("a");
				linkcell.appendChild(anchor);
				linkText = document.createTextNode("Show");
				anchor.appendChild(linkText);
				anchor.setAttribute('productid', product.id);
				anchor.addEventListener("click", (e) => {
					createEstimate.show(e.target.getAttribute("productid"), arrayOptions);
				}, false);
				anchor.href = "#";
				row.appendChild(linkcell);
				self.productcontainerbody.appendChild(row);
			});
			this.productcontainer.style.visibility = "visible";
		}

	}

	function CreateEstimate(_alert, _createcontainer, _createcontainerbody, _createform, _createtable) {
		this.alert = _alert;
		this.createcontainer = _createcontainer;
		this.createcontainerbody = _createcontainerbody;
		this.createform = _createform;
		this.createtable = _createtable;

		this.registerEvents = function(orchestrator) {
			this.createform.querySelector("input[type='button']").addEventListener('click', (e) => {
				var form = e.target.closest("form");
				var self = this;

				//check if at least one option is checked
				var atleastone = false;
				var optionsChecked = document.getElementsByName("checkedOptions");
				for (var i = 0, l = optionsChecked.length; i < l; i++) {
					if (optionsChecked[i].checked) {
						atleastone = true;
						break;
					}
				}

				if (atleastone) {
					if (form.checkValidity()) {
						var product = form.querySelector("input[type = 'hidden']").value;
						makeCall("POST", 'NewEstimate', form,
							function(req) {
								if (req.readyState == 4) {
									var message = req.responseText;
									if (req.status == 200) {
										orchestrator.refresh(product);
									} else if (req.status == 403) {
										window.location.href = req.getResponseHeader("Location");
										window.sessionStorage.removeItem('username');
									}
									else {
										self.alert.textContent = message;
									}
								}
							}
						);
					} else {
						form.reportValidity();
					}
				}
				else {
					self.alert.textContent = "You have to check at least one option";
				}
			});
		}

		this.reset = function() {
			this.createcontainer.style.visibility = "hidden";
			this.createform.style.visibility = "hidden";
			this.createtable.style.visibility = "hidden";
		}

		this.show = function(productid, options) {
			var self = this;
			self.update(options, productid);
			self.createform.productid.value = productid;
		};

		this.update = function(arrayOpts, productid) {
			var row, namecell, typecell, checkcell;
			this.createcontainerbody.innerHTML = "";
			var self = this;
			arrayOpts.forEach(function(opt) {
				// arrayOptions contains ALL the options, i want only the one of the clicked product
				if (opt.prodid == productid) {
					row = document.createElement("tr");

					namecell = document.createElement("td");
					namecell.textContent = opt.name;
					row.appendChild(namecell);

					typecell = document.createElement("td");
					typecell.textContent = opt.type;
					row.appendChild(typecell);

					checkcell = document.createElement("input");
					checkcell.type = 'checkbox';
					checkcell.name = 'checkedOptions';
					checkcell.value = opt.id;
					row.appendChild(checkcell);

					self.createcontainerbody.appendChild(row);
				}
			});
			this.createcontainer.style.visibility = "visible";
			this.createform.style.visibility = "visible";
			this.createtable.style.visibility = "visible";
		}
	}

	function PageOrchestrator() {
		var alertContainer = document.getElementById("id_alert");

		this.start = function() {
			personalMessage = new PersonalMessage(sessionStorage.getItem('username'),
				document.getElementById("id_username"));
			personalMessage.show();

			estimateList = new EstimateList(
				alertContainer,
				document.getElementById("id_estimatecontainer"),
				document.getElementById("id_estimatecontainerbody"));

			estimateDetails = new EstimateDetails({
				alert: alertContainer,
				detailcontainer: document.getElementById("id_detailcontainer"),
				product: document.getElementById("id_product"),
				price: document.getElementById("id_price"),
				estimatedetailstable: document.getElementById("id_estimatedetailstable"),
			});

			estimateOptions = new EstimateOptions(
				alertContainer,
				document.getElementById("id_optioncontainer"),
				document.getElementById("id_optioncontainerbody"));

			productList = new ProductList(
				alertContainer,
				document.getElementById("id_productcontainer"),
				document.getElementById("id_productcontainerbody"));

			createEstimate = new CreateEstimate(
				alertContainer,
				document.getElementById("id_createcontainer"),
				document.getElementById("id_createcontainerbody"),
				document.getElementById("id_createform"),
				document.getElementById("id_createtable"));
			createEstimate.registerEvents(this);

			document.querySelector("a[href='Logout']").addEventListener('click', () => {
				window.sessionStorage.removeItem('username');
			})
		};

		this.refresh = function() {
			alertContainer.textContent = "";
			estimateList.reset();
			estimateDetails.reset();
			estimateOptions.reset();
			createEstimate.reset();
			estimateList.show();
			productList.show();
		};
	}
};
