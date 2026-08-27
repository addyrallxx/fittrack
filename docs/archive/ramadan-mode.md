# Ramadan mode (archived 2026-08-26)

Removed from the UI at the owner's request: "remove ramadan mode for now and
keep it in storage." Nothing was deleted. The feature is dormant, not gone.

## What it did

Regrouped the nutrition tab's meal buckets from the normal set to a fasting
set, so meals landed under Suhoor and Iftar instead of Breakfast / Lunch /
Dinner.

- `MEAL_TYPES_R` - the Ramadan bucket list (Suhoor, Iftar, Other, Snack)
- `MEAL_TYPES_N` - the normal bucket list
- `getMealTypes()` - picks between them on `S.cfg.ramadanMode`
- `renderMealSec()` - orders sections the same way
- `toggleRamadan()` - flips the flag and re-renders Settings

## What changed

1. `DEF_SETTINGS.ramadanMode` now defaults to `false`.
2. The "Mode" settings group containing the toggle row was removed from
   `renderSettings()`.

Everything else is untouched: the flag, both bucket lists, the branching in
`getMealTypes()` and `renderMealSec()`, and `toggleRamadan()` itself.

## How to restore

Put the settings row back into `renderSettings()`, just above the section it
used to precede:

```html
<div class="section-label">Mode</div>
<div class="settings-grp">
  <div class="settings-row">
    <div class="sr-icon" style="background:rgba(255,214,10,0.15)"><span style="font-size:18px">&#127769;</span></div>
    <div><div class="sr-lbl">Ramadan mode</div><div style="font-size:11px;color:var(--t3)">Suhoor / Iftar meal grouping</div></div>
    <div class="toggle${c.ramadanMode!==false?' on':''}" id="rm-toggle" onclick="toggleRamadan()"><div class="toggle-knob"></div></div>
  </div>
</div>
```

No other change is needed. Existing logs keep whatever meal bucket they were
saved under, so historical Suhoor and Iftar entries still render correctly.

## Worth doing when it comes back

Ramadan 2027 begins around 2027-02-17. Rather than a manual toggle, the app
could switch itself on for the Ramadan date window and off afterwards, and
shift the water reminder schedule into non-fasting hours. Note that the water
reminder cron added in the notifications work would otherwise fire during
fasting hours, which is worse than useless.
