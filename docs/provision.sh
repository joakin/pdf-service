sudo curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
sudo npm install npm -g
sudo npm install -g pm2

# Install packages needed for runtime
sudo apt-get update && apt-get install -y xvfb libgtk2.0-0 ttf-mscorefonts-installer libnotify4 libgconf2-4 libnss3 dbus-x11
sudo apt-get install libxtst6

sudo setcap 'cap_net_bind_service=+ep' /usr/bin/nodejs

git clone https://github.com/joakin/pdf-service.git

cd pdf-service

npm install

PORT=80 pm2 start index.js -i 0 --name 'pdf-service'

# Run in virtual framebuffer
PORT=80 RENDERER_ACCESS_KEY=renderpdfwiki xvfb-run --server-args="-screen 0 1024x768x24" electron-render-service
