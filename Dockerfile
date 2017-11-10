FROM openjdk:slim

# install xvfb
RUN apt-get update && apt-get install -y xvfb && rm -rf /var/lib/apt/lists/*

# clear cache to conserve space
RUN apt-get clean

COPY xvfb /etc/init.d/xvfb
RUN chmod +x /etc/init.d/xvfb

RUN echo "service xvfb start" >> /etc/bash.bashrc
ENV DISPLAY :99

RUN mkdir -p /katalon
WORKDIR /katalon

COPY katalon_studio_linux_64 /katalon

RUN ln -s /docker-java-home/jre jre
RUN ln -s /katalon/katalon /usr/bin/katalon

COPY start_xvfb.sh /start_xvfb.sh
RUN chmod +x /start_xvfb.sh

CMD ["/start_xvfb.sh"]