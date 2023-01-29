package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.EstimateDAO;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/InsertPrice")
@MultipartConfig
public class InsertPrice extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

    public InsertPrice() {
        super();
    }
    
	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//get and check params
		String price = request.getParameter("price");
		float pricef = 0;
		try {
			pricef = Float.parseFloat(price);
			if(pricef <= 0 || price.isEmpty()) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Incorrect param values");
				return;
			}
		} catch (NumberFormatException | NullPointerException e) {
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Incorrect or missing param values");
			return;
		}
		
		//insert price into estimate
		int estid = Integer.parseInt(request.getParameter("estimateid"));
		EstimateDAO estimateDAO = new EstimateDAO(connection);
		try {
			estimateDAO.insertPrice(pricef, estid);
		} catch (SQLException e) {
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Incorrect or missing param values");
			return;
		}
		
		//set the estimate to assigned so the list in the homeWorker is updated
		try {
			estimateDAO.setAssigned(estid);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to set estimate assigned");
			return;
		}
		
		//update list of estimates handled by the worker
		HttpSession session = request.getSession();
		User user = (User) session.getAttribute("user");
		try {
			estimateDAO.assignWorker(user.getId(), estid);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to assign worker");
			return;
		}
	}
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
