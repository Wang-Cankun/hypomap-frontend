<template>
  <div>
    <ul>
      <li>
        <router-link to="/atlas/scrna">
          scRNA-seq
          <i class="icon-database-search"></i>
        </router-link>
      </li>
      <li>
        <router-link to="/atlas/spatial">
          Spatial transcriptomics
          <i class="icon-database-search"></i>
        </router-link>
      </li>
    </ul>
    <router-view />
  </div>
</template>
