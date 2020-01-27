base64 -d <<< "IF8gICAgICAgICAgICAgICAgICAgIF8gICAgICBfX19fX18gIF9fXyAgICBfX19fXyAgICAgIF8gICAgICAgICAgICAgICAKfCB8ICAgICAgICAgICAgICAgICAgfCB8ICAgICB8IF9fXyBcLyBfIFwgIC8gIF9fX3wgICAgfCB8ICAgICAgICAgICAgICAKfCB8ICAgICBfX18gIF9fXyAgX19ffCB8X18gICB8IHxfLyAvIC9fXCBcIFwgYC0tLiAgX19ffCB8XyBfICAgXyBfIF9fICAKfCB8ICAgIC8gXyBcLyBfIFwvIF9ffCAnXyBcICB8IF9fXyBcICBfICB8ICBgLS0uIFwvIF8gXCBfX3wgfCB8IHwgJ18gXCAKfCB8X19ffCAgX18vICBfXy8gKF9ffCB8IHwgfCB8IHxfLyAvIHwgfCB8IC9cX18vIC8gIF9fLyB8X3wgfF98IHwgfF8pIHwKXF9fX19fL1xfX198XF9fX3xcX19ffF98IHxffCBcX19fXy9cX3wgfF8vIFxfX19fLyBcX19ffFxfX3xcX18sX3wgLl9fLyAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgfCAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxffCAgICA="
CONFIG="./backend/config.json"

echo
echo "Setting up config.json"

read -p 'Discord Bot Token: ' TOKEN
if [ ${#TOKEN} -le 10 ]; then
  echo "Invalid Bot Token"
  exit 0
fi

read -p 'GMail Email: ' EMAIL
if [ ${#TOKEN} -le 10 ]; then
  echo "Invalid Bot Token"
  exit 0
fi

read -p 'GMail Password: ' PASSWORD
if [ ${#TOKEN} -le 10 ]; then
  echo "Invalid Bot Token"
  exit 0
fi

echo "{\"token\": \"$TOKEN\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}" >> $CONFIG

echo "Setting up database..."
echo "please manually do this for now or fix me"