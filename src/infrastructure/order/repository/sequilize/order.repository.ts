import Order from "../../../../domain/checkout/entity/order";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
/*
Nesse desafio você deverá fazer com que a classe OrderRepository implemente totalmente os métodos definidos pelo OrderRepositoryInterface.
Toda essa implementação deverá ser reproduzida através de testes.
Após realizar tal implementação submeta seu projeto, nesse ponto todos os testes devem estar passando.
Boa sorte.

*/

export default class OrderRepository implements OrderRepositoryInterface {
  
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  update(entity: Order): Promise<void> {
    throw new Error("Method not implemented.");
  }

  find(id: string): Promise<Order> {
    throw new Error("Method not implemented.");
  }
  
  findAll(): Promise<Order[]> {
    throw new Error("Method not implemented.");
  }
}
