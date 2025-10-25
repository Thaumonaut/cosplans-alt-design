# Page snapshot

```yaml
- main [ref=e5]:
  - generic [ref=e6]:
    - button "Toggle sidebar" [ref=e8] [cursor=pointer]:
      - img
    - generic [ref=e9]:
      - button "Toggle theme" [ref=e10] [cursor=pointer]:
        - img
        - img
        - generic [ref=e11]: Toggle theme
      - button [disabled]:
        - img
  - generic [ref=e13]:
    - generic [ref=e14]:
      - img [ref=e16]
      - generic [ref=e17]: Something went wrong
    - generic [ref=e18]:
      - generic [ref=e19]:
        - paragraph [ref=e20]: Not Found
        - paragraph [ref=e21]: We're sorry for the inconvenience. Please try refreshing the page or return to the homepage.
      - generic [ref=e22]:
        - button "Refresh" [ref=e23] [cursor=pointer]:
          - img
          - text: Refresh
        - button "Home" [ref=e24] [cursor=pointer]:
          - img
          - text: Home
      - generic [ref=e25]: Error 404
```