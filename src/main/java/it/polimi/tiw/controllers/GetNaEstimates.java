package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import it.polimi.tiw.beans.Estimate;
import it.polimi.tiw.dao.EstimateDAO;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/GetNaEstimates")
public class GetNaEstimates extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

    public GetNaEstimates() {
        super();
    }
    
	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//the list naestimates contains the estimates not assigned yet
		EstimateDAO estimatesDAO = new EstimateDAO(connection);
		List<Estimate> naestimates = new ArrayList<Estimate>();
		try {
			naestimates = estimatesDAO.findNotAssignedEstimates();
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			response.getWriter().println("Resource not found");
			return;
		}
		
		// Redirect to the Home page and add missions to the parameters
		Gson gson = new Gson();
		String json = gson.toJson(naestimates);
		
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
