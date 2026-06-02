# Photo Organization

Drop photos into category folders so post updates stay simple.

## Folders
- `profile/` - headshots and profile photos
- `research/` - papers, labs, posters, conferences
- `industry/` - internships, full-time work, office moments
- `leadership/` - clubs, events, mentoring, awards
- `travel/` - location and trip photos

## How to use in `about.html`
For single image posts:

```html
<button
  class="pin-card pin-trigger"
  data-image="photos/travel/japan-day1.jpg"
  ...
>
```

For multi-image posts (auto-shuffle in modal):

```html
<button
  class="pin-card pin-trigger"
  data-image="photos/travel/japan-day1.jpg"
  data-images="photos/travel/japan-day1.jpg|photos/travel/japan-day2.jpg|photos/travel/japan-night.jpg"
  ...
>
```

The modal frame uses the first image (`data-image` / first value in `data-images`) as the sizing reference.
