import { Page } from "@playwright/test";
import { Logger } from "winston";

export const fixture = {
    page: undefined as Page,
    logger: undefined as Logger
}