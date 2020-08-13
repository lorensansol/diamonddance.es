<?

// Archivo por el que pasa la extensión 'PHP Server' de 'VS Code'

$uri = $_SERVER['REQUEST_URI'];
$ruta = 'dist'.$uri;
if (preg_match('/\./', $uri)){
  return false;
} elseif ($uri == '/') {
  include($ruta.'index.html');
} else {
  include($ruta.'.html');
}

?>