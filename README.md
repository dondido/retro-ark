# Retro Ark

RetroArk is a user-friendly frontend for the RetroArch, designed for speed and ease of use.

## Auto Scraper

If a entry isn't found in the scraper’s database, a string similarity algorithm is used to find the closest match. This algorithm employs fuzzy string matching, allowing it to identify entries even if the filename contains misspellings or is incomplete. It's based on modified version of Dice’s Coefficient algorithm. Dice’s Coefficient is a statistic that measures the overlap between two sets of elements, such as characters in a string.
