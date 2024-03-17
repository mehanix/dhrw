FROM ubuntu:latest
# build arguments
ARG APP_PACKAGES
ARG APP_LOCALE=en_US
ARG APP_CHARSET=UTF-8
ARG APP_USER=app
ARG APP_USER_DIR=/home/${APP_USER}

# run environment
ENV APP_PORT=${APP_PORT:-3000}


# exposed ports and volumes
EXPOSE $APP_PORT
VOLUME ["/app"]
VOLUME ["/var/run/docker.sock"]
RUN touch /var/run/docker.sock

# add packages for building NPM modules (required by Meteor)
RUN DEBIAN_FRONTEND=noninteractive apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get -y dist-upgrade
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y curl python3 python3-pip build-essential ${APP_PACKAGES}

# install and set the locale (required by Meteor)
RUN apt-get install -y locales && rm -rf /var/lib/apt/lists/* \
    && localedef -i ${APP_LOCALE} -c -f ${APP_CHARSET} -A /usr/share/locale/locale.alias ${APP_LOCALE}.${APP_CHARSET}
ENV LANG ${APP_LOCALE}.${APP_CHARSET}

# Clean apt
RUN DEBIAN_FRONTEND=noninteractive apt-get autoremove
RUN DEBIAN_FRONTEND=noninteractive apt-get clean


# create a non-root user that can write to /usr/local (required by Meteor)
#RUN useradd -mUd ${APP_USER_DIR} ${APP_USER}
#RUN chown -Rh ${APP_USER} /usr/local
#RUN chown -Rh ${APP_USER} /var/run/docker.sock
#
#USER ${APP_USER}

# install Meteor
RUN curl https://install.meteor.com/ | sh
# run Meteor from the app directory
WORKDIR /app
RUN pip install pydantic pandas dill

ENTRYPOINT [ "/usr/local/bin/meteor", "--settings", "settings.json", "--allow-superuser" ]

