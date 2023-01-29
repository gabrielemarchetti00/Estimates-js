package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.beans.Estimate;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.EstimateDAO;
import it.polimi.tiw.dao.EstoptsDAO;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/NewEstimate")
@MultipartConfig
public class NewEstimate extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

    public NewEstimate() {
        super();
    }
    
	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		HttpSession session = request.getSession();
		User user = (User) session.getAttribute("user");
		
		//count number of created estimates till now, so i can set the estid
		int estid = 0;
		EstimateDAO estimatesDAO = new EstimateDAO(connection);
		List<Estimate> allEstimates = new ArrayList<Estimate>();
		try {
			allEstimates = estimatesDAO.findAllEstimates();
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover estimates");
			return;
		}
		estid = allEstimates.size() + 1;
		
		//check if prodid and checked options are valid parameters
		//then create list options for storing the id of the options selected in the checkbox
		Integer prodid = null;
		String prod = request.getParameter("productid");
		String[] options = request.getParameterValues("checkedOptions");
		ArrayList<Integer> optionsid = new ArrayList<Integer>();
		try {
			prodid = Integer.parseInt(prod);
			for(int i=0; i<options.length; i++) {
				optionsid.add(Integer.parseInt(options[i]));
			}
		} catch (NumberFormatException | NullPointerException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Incorrect or missing param values");
			return;
		}
		
		//create estimate
		EstimateDAO estimateDAO = new EstimateDAO(connection);
		try {
			estimateDAO.createEstimate(user.getId(), prodid, estid);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to create estimate");
			return;
		}
		
		//create estopts for storing the options for the just created estimate
		EstoptsDAO estoptsDAO = new EstoptsDAO(connection);
		try {
			for(int i=0; i<optionsid.size(); i++) {
				estoptsDAO.createEstopts(estid, optionsid.get(i));
			}
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to create estopts");
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
