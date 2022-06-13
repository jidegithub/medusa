import { MedusaError } from "medusa-core-utils"
import { EntityManager } from "typeorm"
import { TransactionBaseService } from "../interfaces"
import { CustomShippingOption } from "../models"
import { CustomShippingOptionRepository } from "../repositories/custom-shipping-option"
import { FindConfig, Selector } from "../types/common"
import { CreateCustomShippingOptionInput } from "../types/shipping-options"
import { buildQuery } from "../utils"

class CustomShippingOptionService extends TransactionBaseService<CustomShippingOptionService> {
  protected manager_: EntityManager
  protected transactionManager_: EntityManager | undefined
  protected customShippingOptionRepository_: typeof CustomShippingOptionRepository

  constructor({ manager, customShippingOptionRepository }) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])

    this.manager_ = manager
    this.customShippingOptionRepository_ = customShippingOptionRepository
  }

  /**
   * Retrieves a specific shipping option.
   * @param {string} id - the id of the custom shipping option to retrieve.
   * @param {*} config - any options needed to query for the result.
   * @return {Promise<CustomShippingOption>} which resolves to the requested custom shipping option.
   */
  async retrieve(
    id: string,
    config: FindConfig<CustomShippingOption> = {}
  ): Promise<CustomShippingOption> {
    return await this.atomicPhase_(async (manager) => {
      const customShippingOptionRepo = manager.getCustomRepository(
        this.customShippingOptionRepository_
      )

      const query = buildQuery({ id }, config)

      const customShippingOption = await customShippingOptionRepo.findOne(query)

      if (!customShippingOption) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Custom shipping option with id: ${id} was not found.`
        )
      }

      return customShippingOption
    })
  }

  /** Fetches all custom shipping options related to the given selector
   * @param {Object} selector - the query object for find
   * @param {Object} config - the configuration used to find the objects. contains relations, skip, and take.
   * @return {Promise<CustomShippingOption[]>} custom shipping options matching the query
   */
  async list(
    selector: Selector<CustomShippingOption>,
    config: FindConfig<CustomShippingOption> = {
      skip: 0,
      take: 50,
      relations: [],
    }
  ): Promise<CustomShippingOption[]> {
    return await this.atomicPhase_(async (manager) => {
      const customShippingOptionRepo = manager.getCustomRepository(
        this.customShippingOptionRepository_
      )

      const query = buildQuery(selector, config)

      return customShippingOptionRepo.find(query)
    })
  }

  /**
   * Creates a custom shipping option associated with a given author
   * @param {object} data - the custom shipping option to create
   * @param {*} config - any configurations if needed, including meta data
   * @return {Promise<CustomShippingOption>} resolves to the creation result
   */
  async create(
    data: CreateCustomShippingOptionInput,
    config = { metadata: {} }
  ): Promise<CustomShippingOption> {
    const { metadata } = config
    const { cart_id, shipping_option_id, price } = data

    return this.atomicPhase_(async (manager) => {
      const customShippingOptionRepo = manager.getCustomRepository(
        this.customShippingOptionRepository_
      )

      const customShippingOption = await customShippingOptionRepo.create({
        cart_id,
        shipping_option_id,
        price,
        metadata,
      })
      const result = await customShippingOptionRepo.save(customShippingOption)

      return result
    })
  }
}

export default CustomShippingOptionService