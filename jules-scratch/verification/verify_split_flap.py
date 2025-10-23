from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://913927a4.mta-departure-board.pages.dev")
    page.wait_for_selector("div.container > table > tbody > tr")
    page.click("div.container > table > tbody > tr")
    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
