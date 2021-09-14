# gm identify -verbose ./app/resources/homer.png

gm convert \
    ./app/resources/homer.png \
    -font ./app/resources/impact.ttf \
    -pointsize 50 \
    -fill "#FFF" \
    -stroke "#000" \
    -strokewidth 1 \
    -draw "gravity center text 0,-155 \"Quando\"" \
    -draw "gravity center text 0,155 \"Te chamam para uma festa\"" \
    output.png

echo "complete!"