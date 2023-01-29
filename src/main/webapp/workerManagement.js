{
	let handledList, naList, estimateDetails, estimateOptions, insertPrice,
		pageOrchestrator = new PageOrchestrator(); // main controller

	window.addEventListener("load", () => {
		if (sessionStorage.getItem("username") == null) {
			window.location.href = "index.html";
		} else {
			pageOrchestrator.start(); // initialize the components
			pageOrchestrator.refresh();
		} // display initial content
	}, false);


	function PersonalMessage(_username, messagecontainer) {
		this.username = _username;
		this.show = function() {
			messagecontainer.textContent = this.username;
		}
	}

	function HandledList(_alert, _handledcontainer, _handledcontainerbody) {
		this.alert = _alert;
		this.handledcontainer = _handledcontainer;
		this.handledcontainerbody = _handledcontainerbody;

		this.reset = function() {
			this.handledcontainer.style.visibility = "hidden";
		}

		this.show = function(next) {
			var self = this;
			makeCall("GET", "GetWorkerEstimates", null,
				function(req) {
					if (req.readyState == 4) {
						var message = req.responseText;
						if (req.status == 200) {
							var estimates = JSON.parse(req.responseText);
							if (estimates.length == 0) {
								self.alert.textContent = "No estimates handled yet";
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
			var row, idcell, pricecell;
			this.handledcontainerbody.innerHTML = "";
			var self = this;
			arrayEstimates.forEach(function(estimate) {
				row = document.createElement("tr");

				idcell = document.createElement("td");
				idcell.textContent = estimate.id;
				row.appendChild(idcell);

				pricecell = document.createElement("td");
				pricecell.textContent = estimate.price;
				row.appendChild(pricecell);

				self.handledcontainerbody.appendChild(row);
			});
			this.handledcontainer.style.visibility = "visible";
		}
	}

	function NaList(_alert, _nacontainer, _nacontainerbody) {
		this.alert = _alert;
		this.nacontainer = _nacontainer;
		this.nacontainerbody = _nacontainerbody;

		this.reset = function() {
			this.nacontainer.style.visibility = "hidden";
		}

		this.show = function(next) {
			var self = this;
			makeCall("GET", "GetNaEstimates", null,
				function(req) {
					if (req.readyState == 4) {
						var message = req.responseText;
						if (req.status == 200) {
							var na = JSON.parse(req.responseText);
							if (na.length == 0) {
								self.alert.textContent = "All estimates have been assigned";
								return;
							}
							self.update(na);
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

		this.update = function(arrayNa) {
			var row, idcell, linkcell;
			this.nacontainerbody.innerHTML = "";
			var self = this;
			arrayNa.forEach(function(estimate) {
				row = document.createElement("tr");

				idcell = document.createElement("td");
				idcell.textContent = estimate.id;
				row.appendChild(idcell);

				linkcell = document.createElement("td");
				anchor = document.createElement("a");
				linkcell.appendChild(anchor);
				linkText = document.createTextNode("Insert Price");
				anchor.appendChild(linkText);
				anchor.setAttribute('estimateid', estimate.id);
				anchor.addEventListener("click", (e) => {
					estimateDetails.show(e.target.getAttribute("estimateid"));
					estimateOptions.show(e.target.getAttribute("estimateid"));
					insertPrice.show(e.target.getAttribute("estimateid"));
				}, false);
				anchor.href = "#";
				row.appendChild(linkcell);

				self.nacontainerbody.appendChild(row);
			});
			this.nacontainer.style.visibility = "visible";
		}
	}

	function EstimateDetails(options) {
		this.alert = options['alert'];
		this.detailcontainer = options['detailcontainer'];
		this.client = options['client'];
		this.product = options['product'];
		this.detailstable = options['detailstable'];

		this.reset = function() {
			this.detailcontainer.style.visibility = "hidden";
			this.detailstable.style.visibility = "hidden";
		}

		this.show = function(estimateid) {
			var self = this;
			makeCall("GET", "GetEstimateDetails?estimateid=" + estimateid, null,
				function(req) {
					if (req.readyState == 4) {
						var message = req.responseText;
						if (req.status == 200) {
							var estimate = JSON.parse(req.responseText);
							self.updateEst(estimate);
							self.detailcontainer.style.visibility = "visible";
							self.detailstable.style.visibility = "visible";
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

			makeCall("GET", "GetClientData?estimateid=" + estimateid, null,
				function(req) {
					if (req.readyState == 4) {
						var message = req.responseText;
						if (req.status == 200) {
							var client = JSON.parse(req.responseText);
							self.updateCli(client);
							self.detailcontainer.style.visibility = "visible";
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

		this.updateEst = function(e) {
			this.product.textContent = e.product;
		}

		this.updateCli = function(c) {
			this.client.textContent = c.username;
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

	function InsertPrice(_alert, _priceform) {
		this.alert = _alert;
		this.priceform = _priceform;

		this.registerEvents = function(orchestrator) {
			this.priceform.querySelector("input[type='button']").addEventListener('click', (e) => {
				var form = e.target.closest("form");
				var self = this;

				//check if price is > 0
				var validprice = false;
				var price = this.priceform.querySelector("input[name='price']").value;
				if (price > 0) {
					validprice = true;
				}

				if (validprice) {
					if (form.checkValidity()) {	
						var estimate = form.querySelector("input[type = 'hidden']").value;
						makeCall("POST", 'InsertPrice', form,
							function(req) {
								if (req.readyState == 4) {
									var message = req.responseText;
									if (req.status == 200) {
										orchestrator.refresh(estimate);
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
					self.alert.textContent = "Price must be greater then zero";
				}
			});
		}

		this.reset = function() {
			this.priceform.style.visibility = "hidden";
		}

		this.show = function(estimateid) {
			this.priceform.estimateid.value = estimateid;
			this.priceform.style.visibility = "visible";
		}

	}

	function PageOrchestrator() {
		var alertContainer = document.getElementById("id_alert");

		this.start = function() {
			personalMessage = new PersonalMessage(sessionStorage.getItem('username'),
				document.getElementById("id_username"));
			personalMessage.show();

			handledList = new HandledList(
				alertContainer,
				document.getElementById("id_handledcontainer"),
				document.getElementById("id_handledcontainerbody"));

			naList = new NaList(
				alertContainer,
				document.getElementById("id_nacontainer"),
				document.getElementById("id_nacontainerbody"));

			estimateDetails = new EstimateDetails({
				alert: alertContainer,
				detailcontainer: document.getElementById("id_detailcontainer"),
				client: document.getElementById("id_client"),
				product: document.getElementById("id_product"),
				detailstable: document.getElementById("id_detailstable"),
			});

			estimateOptions = new EstimateOptions(
				alertContainer,
				document.getElementById("id_optioncontainer"),
				document.getElementById("id_optioncontainerbody"));

			insertPrice = new InsertPrice(
				alertContainer,
				document.getElementById("id_priceform")),
				insertPrice.registerEvents(this);

			document.querySelector("a[href='Logout']").addEventListener('click', () => {
				window.sessionStorage.removeItem('username');
			})
		};

		this.refresh = function() {
			alertContainer.textContent = "";
			handledList.reset();
			naList.reset();
			estimateDetails.reset();
			estimateOptions.reset();
			insertPrice.reset();
			naList.show();
			handledList.show();
		};
	}

};