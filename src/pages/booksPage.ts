import { expect, Page } from "@playwright/test";
import HeaderPage from "./headerPage";

export default class BooksPage {

    private header: HeaderPage;
    constructor(private page: Page) {
        this.header = new HeaderPage(page);
    }

    private Elements = {
        categories: "app-book-filter a",
        title: "div.card-title",
        price: "div.card-title +p",
        addToCartBtn: "//button[@color='primary']",
        bookCard: "mat-card",
        snackBar: "//simple-snack-bar/span[1]"

    }

    async verifyAllCategories(categories: string[]) {
        const bookCategories = this.page.locator(this.Elements.categories);
        await expect(bookCategories).toHaveText(categories);
    }

    async addBookToCart(book: string) {
        await this.header.enterBookName(book);
        await expect(this.page.locator(this.Elements.title))
            .toHaveText(book, { ignoreCase: true });
        this.page.click(this.Elements.addToCartBtn);
        const toast = this.page.locator(this.Elements.snackBar);
        await expect(toast).toBeVisible();
        await expect(toast).toHaveText("One Item added to cart");
    }




}