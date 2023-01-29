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

import it.polimi.tiw.beans.Option;
import it.polimi.tiw.dao.OptionDAO;
import it.polimi.tiw.utils.ConnectionHandler;

@WebServlet("/GetEstimateOptions")
public class GetEstimateOptions extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

    public GetEstimateOptions() {
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
		
		//get options of the selected estimate
		OptionDAO optionsDAO = new OptionDAO(connection);
		List<Option> options = new ArrayList<Option>();
		try {
			options = optionsDAO.findOptionsByEstimate(chosenEstimateId);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover options");
			return;
		}
		
		// Redirect to the Home page and add estimate to the parameters
		String json = new Gson().toJson(options);
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
