#!/usr/bin/env sh
set -e

##############################################################################
# Update Semantic UI
#
# Using semantic-ui-less in node_modules, this script will:
#   - copy assets to our project
#   - copy definitions/themes to our project
#   - make meteor happy:
#     - rename all files *.less (SUI uses *.variables, *.overrides, *.config)
#     - replace all references to those ^ files

BASE_SOURCE_DIR="node_modules/semantic-ui-less"
BASE_TARGET_DIR="client/imports/styles/semantic-ui-less"

# Updates references to SUI *.variables, *.overrides, *.config files
# to Meteor friendly *.less extensions
parse_less_file() {
  local input="$1"
  local output="$2"

  cat "$input" | \
  sed -e "s/\.variables/\.variables\.less/g" | \
  sed -e "s/\.overrides/\.overrides\.less/g" | \
  sed -e "s/\.config/\.config\.less/g" | \
  # remove CR from CRLF newline characters
  tr -d "\r" | \
  # ensure eof newline
  sed -e '$a\' > "$output"
}

# Copies all *.variables, *.overrides, *.config files from the node_module
# to our project directory, renaming and parsing as it goes
update_less_files_in_dir() {
  local dir="$1"
  echo "... updating $dir less files"
  target_dir="$BASE_TARGET_DIR/$dir"
  source_dir="$BASE_SOURCE_DIR/$dir"

  # clear our copy of this dir
  rm -rf "$target_dir"

  # copy all style files over, updating names and references for meteor
  for file in $(find "$source_dir" -name "*.less" -o -name "*.overrides" -o -name "*.variables"); do
    # move the file from the source to the destination
    target_filename=$(echo "$file" | sed -e "s=$source_dir=$target_dir=")
    # append *.less if not present
    target_filename=${target_filename%.less}.less
    target_dirname=$(dirname "$target_filename")

    # ensure target dirs exists
    mkdir -p "$target_dirname"

    # output to new filename with .less appended
    parse_less_file "$file" "$target_filename"
  done
}

# update directories
update_less_files_in_dir "definitions"
update_less_files_in_dir "themes/default"

# update assets
echo "... updating public assets"
fonts_dir="public/fonts/semantic-ui"
images_dir="public/images/semantic-ui"

rm -rf "$fonts_dir"
mkdir -p "$fonts_dir"
cp -R "$BASE_SOURCE_DIR"/themes/default/assets/fonts/* "$fonts_dir"

rm -rf "$images_dir"
mkdir -p "$images_dir"
cp -R "$BASE_SOURCE_DIR"/themes/default/assets/images/* "$images_dir"

# update root files
echo "... updating root files"
parse_less_file "$BASE_SOURCE_DIR/theme.less" "$BASE_TARGET_DIR/theme.less"

echo "... Done!"
