import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            async with page.expect_download() as download_info:
                await page.goto("http://localhost:4200")
                download = await download_info.value
                await download.save_as("jules-scratch/verification/arrival-times.txt")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
