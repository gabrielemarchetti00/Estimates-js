package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.lang.String;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import it.polimi.tiw.beans.Option;
import it.polimi.tiw.beans.Product;
import it.polimi.tiw.dao.ProductDAO;
import it.polimi.tiw.dao.OptionDAO;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/GetProductsAndOptions")
public class GetProductsAndOptions extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public GetProductsAndOptions() {
		super();
	}

	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}
	
	// new class created for storing both the products list and the options list, so when a product has been
	// clicked no call to the server are made to display his options
	private class DoubleList {
		private final List<Product> products;
        private final List<Option> options;
        
        DoubleList(List<Product> products, List<Option> options){
            this.products = products;
            this.options = options;
        }
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		ProductDAO productsDAO = new ProductDAO(connection);
		List<Product> products = new ArrayList<Product>();
		try {
			products = productsDAO.findAllProducts();
		} catch (SQLException e) {
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover products");
			return;
		}
		
		OptionDAO optionsDAO = new OptionDAO(connection);
		List<Option> options = new ArrayList<Option>();
		try {
			options = optionsDAO.findAllOptions();
		} catch (SQLException e) {
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover options");
			return;
		}
		
		DoubleList dl = new DoubleList(products, options);

		// Redirect to the Home page and add missions to the parameters
		Gson gson = new Gson();
		String json = gson.toJson(dl);
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doGet(request, response);
	}

	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

}