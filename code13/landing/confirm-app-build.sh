#!/usr/bin/env sh
set -e

confirm_app_build() {
  echo "  Did you run a fresh build first (y/N)? \c"
  read answer
  if [ "$answer" = "y" ]; then
    echo ""
    echo "  Let's go!"
    echo ""
    exit 0
  fi

  if [ "$answer" = "n" ]; then
    echo ""
    echo "  Before Deploy:"
    echo "    1) cd to /app"
    echo "    2) start the app (builds assets)"
    echo "    3) stop the app  (don't run during deploy)"
    echo "    4) come back and deploy"
    echo ""
    echo "  See you soon :)"
    echo ""
    exit 1
  fi

  echo "  Please answer 'y' or 'n'."
  confirm_app_build
}

echo ""
echo "  Heads Up!"
echo "  The landing page requires assets from '/app/.meteor'"
echo ""

confirm_app_build
