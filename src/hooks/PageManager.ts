import { BrowserContext, Page } from "@playwright/test";
import { normalizeUrl } from "../helper/util/helpers";

export default class PageManager {
    private pages: Page[];
    private currentPage: Page;

    constructor() {
        this.pages = [];
        this.currentPage = null;
    }

    get Pages(): Page[] {
        return this.pages;
    }

    get Page(): Page {
        return this.currentPage;
    }

    async newPage(context: BrowserContext): Promise<Page> {
        const page = await context.newPage();
        this.pages.push(page);
        this.currentPage = page;
        return page;
    }

    async selectPage(pageOrIndex: Page | number): Promise<void> {
        const page = await this.getPage(pageOrIndex);
        if (!page.isClosed()) {
            await page.bringToFront();
            this.currentPage = page;
        } else {
            throw new Error(`Cannot select a closed page: ${page}`);
        }
    }

    async closePage(pageOrIndex: Page | number = this.currentPage): Promise<void> {
        const page = await this.getPage(pageOrIndex);
        if (page) {
            await page.close();
            const index = this.pages.indexOf(page);
            if (index !== -1) {
                this.pages.splice(index, 1);
            }
            if (this.currentPage === page) {
                this.currentPage = this.pages[0] || null;
            }
        }
    }

    async closeAllPages(): Promise<void> {
        await Promise.all(this.pages.map((page) => page.close()));
        this.pages = [];
        this.currentPage = null;
    }

    async closeAllOtherPages(pageOrIndex: Page | number = this.currentPage): Promise<void> {
        const currentPage = await this.getPage(pageOrIndex);
        if (currentPage) {
            await Promise.all(this.pages.filter((page) => page !== currentPage).map((page) => page.close()));
            this.pages = [currentPage];
            this.currentPage = currentPage;
        }
    }

    async hasPage(pageOrIndex: Page | number): Promise<boolean> {
        try {
            await this.getPage(pageOrIndex);
            return true;
        } catch (error) {
            return false;
        }
    }

    async getPage(pageOrIndex: Page | number): Promise<Page> {
        if (typeof pageOrIndex === "number") {
            const index = pageOrIndex;
            if (index >= 0 && index < this.pages.length) {
                return this.pages[index];
            } else {
                throw new Error(`Invalid page index: ${index}`);
            }
        } else {
            const page = pageOrIndex;
            if (this.pages.includes(page)) {
                return page;
            } else {
                throw new Error(`Page not found: ${page}`);
            }
        }
    }

    async getPageByURL(url: string): Promise<Page | undefined> {
        for (const page of this.pages) {
            if (await normalizeUrl(page.url()) === normalizeUrl(url)) {
                return page;
            }
        }
        return undefined;
    }

    async getPageByTitle(title: string): Promise<Page | undefined> {
        for (const page of this.pages) {
            if (await page.title() === title) {
                return page;
            }
        }
        return undefined;
    }

    async selectPageByURL(url: string): Promise<void> {
        const page = await this.getPageByURL(url);
        if (page) {
            await this.selectPage(page);
        } else {
            throw new Error(`No page found with URL: ${url}`);
        }
    }

    async selectPageByTitle(title: string): Promise<void> {
        const page = await this.getPageByTitle(title);
        if (page) {
            await this.selectPage(page);
        } else {
            throw new Error(`No page found with title: ${title}`);
        }
    }

    getPageCount(): number {
        return this.pages.length;
    }

    getPageIndex(page: Page = this.currentPage): number {
        return this.pages.indexOf(page);
    }

    async switchToNextPage(): Promise<void> {
        const currentIndex = this.getPageIndex();
        const nextIndex = (currentIndex + 1) % this.pages.length;
        await this.selectPage(nextIndex);
    }

    async switchToPreviousPage(): Promise<void> {
        const currentIndex = this.getPageIndex();
        const previousIndex = (currentIndex - 1 + this.pages.length) % this.pages.length;
        await this.selectPage(previousIndex);
    }
}