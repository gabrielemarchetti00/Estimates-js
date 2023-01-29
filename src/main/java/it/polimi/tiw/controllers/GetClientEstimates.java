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
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;

import it.polimi.tiw.beans.Estimate;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.EstimateDAO;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/GetClientEstimates")
public class GetClientEstimates extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

    public GetClientEstimates() {
        super();
    }
    
	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//show list of estimates created by the client
		HttpSession session = request.getSession();
		User user = (User) session.getAttribute("user");
		EstimateDAO estimatesDAO = new EstimateDAO(connection);
		List<Estimate> estimates = new ArrayList<Estimate>();
		try {
			estimates = estimatesDAO.findEstimatesByClient(user.getId());
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			response.getWriter().println("Resource not found");
			return;
		}
		
		// Redirect to the Home page and add missions to the parameters
		Gson gson = new Gson();
		String json = gson.toJson(estimates);
		
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
