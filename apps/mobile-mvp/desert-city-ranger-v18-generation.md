# Ranger road and seating correction — draft

Built-in image generation. Source v17; successive edits attempted equal perspective lanes, right-lane placement and front-left driver seating. Output `public/landing-desert-city-ranger-v18-draft.png`. Previous assets preserved, no live references changed.

## Road prompt

Correct road divider and truck placement only. The previous divider is too far toward right rail. Draw a dashed white centerline from image coordinate (820,940) at bottom edge to vanishing point (1540,420), following a straight perspective line. This separates road into equal lanes measured between left and right curb, not image margins. Erase old divider. Shift the whole truck RIGHT enough that its leftmost tires are right of this line at their contact points, staying between new divider and right curb. Keep truck shape same rear-right three-quarter angle, can shift slightly farther forward to fit lane. Truck drives toward city. Preserve background geometry, road edges, sky, city, river, bridge rails and style. NPC in far front-left driver's seat, not rear row, empty right front passenger seat nearest camera. Only one person, navy shirt. No other lane divider lines.

## Final cabin prompt

Only fix duplicate occupant in truck cabin. Keep exactly ONE bald NPC, seated FRONT LEFT at the far side of cabin behind the left-hand steering wheel. Remove the bald head and torso visible on the RIGHT side of the rear windshield. Rear windshield should show only empty rear seatbacks/headrests, not a man. Keep the small forward driver visible in front of the cabin; no rear passengers. Do not alter road divider, lane widths, truck position in right lane, truck exterior, background, perspective or camera. The road and truck placement are locked. Navy shirt calm face. Empty front right passenger seat.

## Review

Truck is to the right of the divider and road division is more balanced. Generation altered camera/bridge perspective somewhat. NPC placement remains visually ambiguous and is not accepted as a verified front-left driver-seat correction. Draft only.
