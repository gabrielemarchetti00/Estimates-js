package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import it.polimi.tiw.beans.Estimate;
import it.polimi.tiw.dao.EstimateDAO;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/GetEstimateDetails")
public class GetEstimateDetails extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

    public GetEstimateDetails() {
        super();
    }
    
	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//get and check params
		String chosenEstimate = request.getParameter("estimateid");
		Integer chosenEstimateId = null;
		try {
			chosenEstimateId = Integer.parseInt(chosenEstimate);
		} catch (NumberFormatException | NullPointerException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Incorrect param values");
			return;
		}
		
		//check if an estimate with that id exists
		EstimateDAO estimateDAO = new EstimateDAO(connection);
		Estimate estimate = null;
		try {
			estimate = estimateDAO.findEstimateById(chosenEstimateId);
			if (estimate == null) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND);
				response.getWriter().println("Resource not found");
				return;
			}
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover estimate");
			return;
		}
		
		// Redirect to the Home page and add estimate to the parameters
		String json = new Gson().toJson(estimate);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);
	}
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

}
