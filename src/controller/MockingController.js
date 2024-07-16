import { mockingService } from "../repository/mockingService.js";

export default class MockingController {

    static getProducts = async(request, response) => {
        
        let product = await mockingService.getProducts();

        response.setHeader('Content-Type','application/json');
        return response.status(200).json({status:"succes", payload: product});
    }


}