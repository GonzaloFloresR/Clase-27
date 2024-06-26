import { TicketsMongoDAO as DAO } from "../dao/TicketsMongoDAO.js"

class TicketsService {
    constructor(dao){
        this.TicketsDao = dao;
    }

    async getTickets(limit=10){
        return await this.TicketsDao.get(limit);
    }

    async getTicketBy(filter){
        return await this.TicketsDao.getBy(filter);
    }

    async createNewTicket(NewCart){
        return await this.CartsDao.create(NewCart);
    }
}

export const ticketsService = new TicketsService(new DAO());