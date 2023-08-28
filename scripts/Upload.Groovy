
def uploadToS3(String bucketUrl) {
  s3Upload(
    consoleLogLevel: 'INFO',
    dontWaitForConcurrentBuildCompletion: false,
    entries: [[
      bucket: bucketUrl,
      excludedFile: '',
      flatten: false,
      gzipFiles: false,
      keepForever: false,
      managedArtifacts: false,
      noUploadOnFailure: true,
      selectedRegion: 'ap-south-1',
      showDirectlyInBrowser: false,
      sourceFile: 'www/**',
      storageClass: 'STANDARD',
      uploadFromSlave: false,
      useServerSideEncryption: false
    ]],
    pluginFailureResultConstraint: 'FAILURE',
    profileName: 'tracified-admin-frontend-jenkins-deployer',
    userMetadata: [],
    dontSetBuildResultOnFailure: false
  )
}

def uploadToGCB(String bucketUrl) {
  step([
    $class: 'ClassicUploadStep',
    credentialsId: 'main-gcp',
    bucket: bucketUrl,
    pattern: 'www/**',
    showInline: true,
    pathPrefix: 'www/'
  ])
}

return this
