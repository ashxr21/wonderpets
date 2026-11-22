Test Case 2: The Broken CSS Layouts

Field      Detail

Test ID    TC-02

Type       UI Verification / Visual Regression

Steps      Open the landing page and compare against the design

Expected   Styled glass cards, gradient buttons, aligned navbar  

Actual     Layout scattered across the page with no styling applied (Style Pipeline 
           Failure)

Severity   High
Root cause Tailwind was not initialized: the directive was missing in src/index.
           css , and the Tailwind plugin was not aligned in the Vite configuration

Fix        Added @import "tailwindcss"; to src/index.css and registered tailwindcss\
           () in the plugins array of vite.config.js

Retest     Pass. Styling renders as designed
result

Cycle 1 outcome: application loads and renders with correct styling.

2. TEST CYCLE 2: COMPONENT NAVIGATION & TAB STABILITY
Objective: verify that moving between screens works without breaking the layout (Navigation Testing, Regression Testing).

Test Case 3: The Multi-Tab UI Bug

Field      Detail

Test ID    TC-03

Type       Navigation / Layout Regression

Steps      Sign in, then switch between Customers and Products

Expected   Both tabs keep the same layout

Actual     Sign-In and Customers worked flawlessly, but switching to Products 
           scattered the layout again (Layout Breakdown)

Severity   Medium

Root cause The Products screen still used old inline classes that did not match the 
           Tailwind layout system

Fix        Replaced the old inline classes with proper Tailwind flex and grid      
           wrappers

Retest     Pass. Products matches the Customers layout
result