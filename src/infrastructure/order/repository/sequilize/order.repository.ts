import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
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

  async update(entity: Order): Promise<void> {
    await OrderModel.update({
      customerId: entity.customerId,
      items: entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
      })),
    },
      {
        where: {
          id: entity.id,
        },
      }
    );
    entity.items.forEach(item => {
      OrderItemModel.destroy({ where: { id: item.id } });
      OrderItemModel.create({
        id: item.id,
        order_id: entity.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
      });
    });

  }


  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        include: ["items"],
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Order not found");
    }
    let items: OrderItem[] = [];
    orderModel.items.forEach(item => {
      items.push(new OrderItem(
        item.id,
        item.name,
        item.price,
        item.product_id,
        item.quantity
      ));
    });

    const order = new Order(id, orderModel.customer_id, items);

    return order;
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({ include: ["items"] });

    const orders = orderModels.map((orderModel) => {
      let items: OrderItem[] = [];
      orderModel.items.forEach(item => {
        items.push(new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        ));
      });
      let order = new Order(orderModel.id, orderModel.customer_id, items);
      return order;
    });

    return orders;
  }
}
