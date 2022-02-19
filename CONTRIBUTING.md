# Contribution Guidelines

The easiest way to find ways to contribute to CookieTrack's development is to browse the following:

- The `Projects` section of this repository will have many issues listed as `To Do`.
- The `Issues` section of this repository can be sorted by items with the `Help Wanted` label.

## Suggesting Support for New Dapp

Want a new dapp to be supported by CookieTrack? Feel free to create a new issue here by going to `Issues`, `New Issue` and selecting the `New Project` template to make it easier for all involved to see what you are suggesting.

## Reporting Bugs

Found a bug? You can either choose to report it in our [Discord server](https://discord.com/invite/DzADcq7y75) in the #bug-reports channel, or by creating an issue on this repository. To do so, go to `Issues`, `New Issue`, and you'll see a template for bug reports to facilitate your report.

## Adding New API Routes

Want to create a new route for a dapp that is currently not supported? Feel free to submit a pull request with the following:

- Any relevant new token addresses or logos updated in `/functions/src/tokens.ts`.
- Any relevant new ABIs updated in `/functions/src/ABIs.ts`.
- A file in `/functions/src/routes/` for the appropriate chain with your new API route, as a `.ts` file.

There is a route template at `/functions/src/routes/template.ts` to help new contributors.

If your PR isn't reviewed right away, reach out in our [Discord server](https://discord.com/invite/DzADcq7y75)!

## Tracking New Token

In order to track a new token, first ensure it has a price feed available either through CoinGecko, ParaSwap or 1Inch.

If so, simply add the token's information to `/functions/src/tokens.ts`.

## Donations

Donations can be made to the developers of CookieTrack through the following wallet addresses:

**Ethereum:** ncookie.eth

**BSC/Polygon/Fantom/Avalanche/Harmony:** 0xbE4FeAE32210f682A41e1C41e3eaF4f8204cD29E

## Other Contributions

For any other type of contribution, please reach out in our [Discord server](https://discord.com/invite/DzADcq7y75)!
