/*
list of known / reserved keys:
$enabled
$isLeaf - tells if node is final in the tree
$name -
 */

export default {
  make(...a){
    return Object.assign({}, ...a);
  },
  meta(o, ...a){
    let ret = o;
    a.forEach((o) => {
      ret = Object.assign(ret, o.$meta)
    })
    return {$meta: ret};
  },
  // enabled node
  get E(){
    return {
      $meta: {
        enabled: 1,
        isLeaf: 1
      }
    }
  },
  // disabled node
  get D(){
    return {
      $meta: {
        enabled: 0,
        isLeaf: 1
      }
    }
  }
}
