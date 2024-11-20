import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import CustomerRepositoryInterface from "../../../../domain/customer/repository/customer-repository.interface";
import CustomerModel from "./customer.model";
import EventDispatcher from "../../../../domain/@shared/event/event-dispatcher";
import EnviaConsoleLog1Handler from "../../../../domain/customer/event/handler/print-message-when-customer-is-created-01.handler";
import EnviaConsoleLog2Handler from "../../../../domain/customer/event/handler/print-message-when-customer-is-created-02.handler";
import CustomerCreatedEvent from "../../../../domain/customer/event/customer-created.event";

export default class CustomerRepository implements CustomerRepositoryInterface {

  private _customerCreatedEvent: CustomerCreatedEvent;
  private eventDispatcher = new EventDispatcher();
  private _enviaConsoleLog1Handler = new EnviaConsoleLog1Handler();
  private _enviaConsoleLog2Handler = new EnviaConsoleLog2Handler();

  get customerCreatedEvent() {
    return this._customerCreatedEvent;
  }

  get enviaConsoleLog1Handler() {
    return this._enviaConsoleLog1Handler;
  }

  get enviaConsoleLog2Handler() {
    return this._enviaConsoleLog2Handler;
  }

  async create(entity: Customer): Promise<void> {
    let customer = {
      id: entity.id,
      name: entity.name,
      street: entity.Address.street,
      number: entity.Address.number,
      zipcode: entity.Address.zip,
      city: entity.Address.city,
      active: entity.isActive(),
      rewardPoints: entity.rewardPoints,
    };
    await CustomerModel.create(customer);


    this.eventDispatcher.register("CustomerCreatedEvent", this._enviaConsoleLog1Handler);
    this.eventDispatcher.register("CustomerCreatedEvent", this._enviaConsoleLog2Handler);
    this._customerCreatedEvent = new CustomerCreatedEvent(customer);
    this.eventDispatcher.notify(this._customerCreatedEvent);
  }

  async update(entity: Customer): Promise<void> {
    await CustomerModel.update(
      {
        name: entity.name,
        street: entity.Address.street,
        number: entity.Address.number,
        zipcode: entity.Address.zip,
        city: entity.Address.city,
        active: entity.isActive(),
        rewardPoints: entity.rewardPoints,
      },
      {
        where: {
          id: entity.id,
        },
      }
    );
  }

  async find(id: string): Promise<Customer> {
    let customerModel;
    try {
      customerModel = await CustomerModel.findOne({
        where: {
          id,
        },
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Customer not found");
    }

    const customer = new Customer(id, customerModel.name);
    const address = new Address(
      customerModel.street,
      customerModel.number,
      customerModel.zipcode,
      customerModel.city
    );
    customer.changeAddress(address);
    return customer;
  }

  async findAll(): Promise<Customer[]> {
    const customerModels = await CustomerModel.findAll();

    const customers = customerModels.map((customerModels) => {
      let customer = new Customer(customerModels.id, customerModels.name);
      customer.addRewardPoints(customerModels.rewardPoints);
      const address = new Address(
        customerModels.street,
        customerModels.number,
        customerModels.zipcode,
        customerModels.city
      );
      customer.changeAddress(address);
      if (customerModels.active) {
        customer.activate();
      }
      return customer;
    });

    return customers;
  }
}
