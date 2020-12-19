# diamonddance.es

## Jekyll

### Install

Jekyll install from root directory

```bash
gem install bundler
bundle install
```

### Server

Jekyll server start

```bash
# local (development)
bundle exec jekyll serve --watch --config _config.yml,_config_dev.yml

# production
JEKYLL_ENV=production bundle exec jekyll serve --watch
```

## Deploy

Deploy with date now

```bash
# deploy with date now
git add .;git commit -m "Update: `date +'%Y-%m-%d %H:%M:%S'`";git push
```

## FALTA

- netlify cms
- colors links for each model
- desgin product info
- next/prev product with keyboard
- cart with paypal
- filter/categories
- legal and cookies