Pod::Spec.new do |s|
  s.name = 'VehicleRadio'
  s.version = '1.0.0'
  s.summary = 'Local audio output inspection for VehicleSenseX'
  s.description = s.summary
  s.license = { :type => 'Proprietary' }
  s.author = 'VehicleSenseX'
  s.homepage = 'https://docs.expo.dev/modules/'
  s.platforms = { :ios => '16.4' }
  s.swift_version = '5.9'
  s.source = { :path => File.expand_path('..', __dir__) }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
end
