export class GetCategoryUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(categoryId) {
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      throw new Error("Category not found.");
    }

    return category;
  }
}
